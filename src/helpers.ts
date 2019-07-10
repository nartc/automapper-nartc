import {
  ConditionPredicate, DestinationMappingProperty,
  DestinationMappingTransformation,
  DestinationMemberConfigurationOptions,
  DestinationTransformationType,
  ForMemberFn,
  ForMemberValueOrFunction,
  ForSourceMemberFn, MappingProperty,
  MemberCallback,
  MemberMappingMetadata, SourceMappingProperty,
  SourceMemberConfigurationOptions
} from './types'

export const handleCurrying = (fn: Function, args: IArguments, closure: any): any => {
  const argumentsStillToCome = fn.length - args.length

  // saved accumulator array
  // NOTE BL this does not deep copy array objects, only the array itself; should side effects occur, please report (or
  // refactor).
  let argumentsCopy = Array.prototype.slice.apply(args)

  function accumulator(moreArgs: IArguments, alreadyProvidedArgs: Array<any>, stillToCome: number): Function {
    let previousAlreadyProvidedArgs = alreadyProvidedArgs.slice(0) // to reset
    let previousStillToCome = stillToCome // to reset

    for (let i = 0; i < moreArgs.length; i++ , stillToCome--) {
      alreadyProvidedArgs[alreadyProvidedArgs.length] = moreArgs[i]
    }

    if (stillToCome - moreArgs.length <= 0) {
      let functionCallResult = fn.apply(closure, alreadyProvidedArgs)

      // reset vars, so curried function can be applied to new params.
      alreadyProvidedArgs = previousAlreadyProvidedArgs
      stillToCome = previousStillToCome

      return functionCallResult
    } else {
      return function(): Function {
        // arguments are params, so closure business is avoided.
        return accumulator(arguments, alreadyProvidedArgs.slice(0), stillToCome)
      }
    }
  }

  return accumulator(([] as any) as IArguments, argumentsCopy, argumentsStillToCome)
}

export const getMappingMetadata = <TSource, TDestination>(
  sourceFn: ForMemberFn<any>,
  transformation: ForMemberValueOrFunction<TSource, TDestination> | ForSourceMemberFn<TSource>,
  sourceMapping: boolean
): MemberMappingMetadata<TSource, TDestination> => {
  const sourceFnString = sourceFn.toString()
  const sourceFnKey = sourceFnString.split('.').pop() as string

  if (typeof transformation !== 'function') {
    return {
      async: false,
      ignore: false,
      destination: sourceFnKey as keyof TDestination,
      source: sourceFnKey as keyof TSource,
      sourceMapping,
      condition: undefined,
      transformation: getDestinationTransformation(transformation, true, sourceMapping, false)
    }
  }

  const params = getFunctionParameters(sourceFnString)
  const optsParam = params.length >= 1 ? params[0] : ''
  const source = sourceMapping ? sourceFnKey : getMapFromString(sourceFnString, sourceFnKey, optsParam)
  const metadata: MemberMappingMetadata<TSource, TDestination> = {
    destination: sourceFnKey as keyof TDestination,
    source: source as keyof TSource,
    transformation: getDestinationTransformation(transformation, true, sourceMapping, params.length === 2),
    sourceMapping,
    condition: undefined,
    ignore: getIgnoreFromString(sourceFnString, sourceFnKey),
    async: params.length === 2
  }

  if (!metadata.async && getFunctionCallIndex(sourceFnString, 'condition', optsParam) >= 0) {
    metadata.condition = getConditionFromFunction(transformation as ForMemberValueOrFunction<TSource, TDestination>,
      source as keyof TSource)
  }

  return metadata
}

export const getDestinationTransformation = <TSource, TDestination>(
  transformation: ForMemberValueOrFunction<TSource, TDestination> | ForSourceMemberFn<TSource>,
  isFunction: boolean,
  sourceMapping: boolean,
  async: boolean
): DestinationMappingTransformation<TSource, TDestination> => {
  if (!isFunction) {
    return {
      transformationType: DestinationTransformationType.Constant,
      constant: transformation as ReturnType<ForMemberFn<TDestination>>
    }
  }

  if (sourceMapping) {
    if (async) {
      return {
        transformationType: DestinationTransformationType.AsyncSourceMemberOptions,
        asyncSourceMemberConfigurationOptionsFn: transformation as ForSourceMemberFn<TSource>
      }
    }

    return {
      transformationType: DestinationTransformationType.SourceMemberOptions,
      sourceMemberConfigurationOptionsFn: transformation as ((opts: SourceMemberConfigurationOptions<TSource>) => any)
    }
  }

  if (async) {
    return {
      transformationType: DestinationTransformationType.AsyncMemberOptions,
      asyncMemberConfigurationOptionsFn: transformation as ((
        opts: DestinationMemberConfigurationOptions<TSource, TDestination>,
        cb: MemberCallback<TDestination>
      ) => any)
    }
  }

  return {
    transformationType: DestinationTransformationType.MemberOptions,
    memberConfigurationOptionsFn: transformation as ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => any)
  }
}

export const getFunctionParameters = (fnString: string): string[] => {
  const stripComments = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
  const argumentNames = /([^\s,]+)/g

  let functionString = fnString.replace(stripComments, '')

  let functionParameterNames = functionString.slice(functionString.indexOf('(') + 1, functionString.indexOf(')'))
    .match(argumentNames)
  if (functionParameterNames === null) {
    functionParameterNames = new Array<string>()
  }
  return functionParameterNames
}

export const getMapFromString = (fnString: string, defaultValue: string, optionsParamName: string): string => {
  let indexOfMapFrom = getFunctionCallIndex(fnString, 'mapFrom', optionsParamName)
  if (indexOfMapFrom < 0) {
    return defaultValue
  }

  let indexOfMapFromStart = fnString.indexOf('(', indexOfMapFrom) + 1
  let indexOfMapFromEnd = fnString.indexOf(')', indexOfMapFromStart)

  if (indexOfMapFromStart < 0 || indexOfMapFromEnd < 0) {
    return defaultValue
  }

  let mapFromString = fnString.substring(indexOfMapFromStart, indexOfMapFromEnd).replace(/'/g, '').replace(/"/g, '')
    .trim()
  return mapFromString === null || mapFromString === ''
         ? defaultValue
         : mapFromString
}

export const getFunctionCallIndex = (fnString: string, fnToLookFor: string, optionsParamName: string): number => {
  let indexOfFunctionCall = fnString.indexOf(optionsParamName + '.' + fnToLookFor)
  if (indexOfFunctionCall < 0) {
    indexOfFunctionCall = fnString.indexOf('.' + fnToLookFor)
  }

  return indexOfFunctionCall
}

export const getIgnoreFromString = (fnString: string, optionsParameterName: string): boolean => {
  let indexOfIgnore = getFunctionCallIndex(fnString, 'ignore', optionsParameterName)
  if (indexOfIgnore < 0) {
    return false
  }

  let indexOfMapFromStart = fnString.indexOf('(', indexOfIgnore) + 1
  let indexOfMapFromEnd = fnString.indexOf(')', indexOfMapFromStart)

  if (indexOfMapFromStart < 0 || indexOfMapFromEnd < 0) {
    return false
  }

  let ignoreString = fnString
    .substr(indexOfMapFromStart, indexOfMapFromEnd)
    .replace(/\r/g, '')
    .replace(/\n/g, '')
    .trim()
  return ignoreString === null || ignoreString === ''
}

export const getConditionFromFunction = <TSource, TDestination>(
  transformation: ForMemberValueOrFunction<TSource, TDestination>,
  sourceProp: keyof TSource
): ConditionPredicate<TSource> => {
  // Since we are calling the valueOrFunction function to determine whether to ignore or map from another property, we
  // want to prevent the call to be error prone when the end user uses the '(opts)=>
  // opts.sourceObject.sourcePropertyName' syntax. We don't actually have a source object when creating a mapping;
  // therefore, we 'stub' a source object for the function call.
  let sourceObject: TSource = {} as TSource
  sourceObject[sourceProp] = {} as TSource[keyof TSource]

  let condition: ConditionPredicate<TSource> = () => true

  // calling the function will result in calling our stubbed ignore() and mapFrom() functions if used inside the
  // function.
  const configFuncOptions: DestinationMemberConfigurationOptions<TSource, TDestination> = {
    ignore: (): void => {
      // do nothing
    },
    condition: (predicate: ConditionPredicate<TSource>): void => {
      condition = predicate
    },
    mapFrom: () => {
      // do nothing
    },
    sourceObject: sourceObject,
    sourcePropertyName: sourceProp,
    intermediatePropertyValue: {}
  }

  try {
    (transformation as ((opts: DestinationMemberConfigurationOptions<TSource, TDestination>) => any))(configFuncOptions)
  } catch (exc) {
    // do not handle by default.
  }

  return condition
}

export const findProperty = <TSource, TDestination>(
  name: string,
  existingProperties: Array<SourceMappingProperty<TSource, TDestination>>
): MappingProperty<TSource, TDestination> | null => {
  if (!existingProperties) {
    return null
  }

  for (const prop of existingProperties) {
    if (prop.name === name) {
      return prop
    }
  }

  return null
}

export const matchSourcePropertyByDestination = <TSource, TDestination>(
  property: SourceMappingProperty<TSource, TDestination>,
  existingProperties: Array<SourceMappingProperty<TSource, TDestination>>
): SourceMappingProperty<TSource, TDestination> | null => {
  if (!existingProperties) {
    return null
  }

  for (const prop of existingProperties) {
    if (prop.destinationPropertyName === property.destinationPropertyName) {
      return prop
    }
  }

  return null
}

export const getDestinationProperty = <TSource, TDestination>(
  destinationPropertyName: keyof TDestination,
  existingSource: SourceMappingProperty<TSource, TDestination>
): DestinationMappingProperty<TSource, TDestination> | null => {
  if (existingSource.destination) {
    return existingSource.destination
  }

  for (const child of existingSource.children) {
    const destination = getDestinationProperty(destinationPropertyName, child)
    if (destination) {
      return destination
    }
  }

  return null
}

export const handleMapFromProperties = <TSource, TDestination>(
  property: MappingProperty<TSource, TDestination>,
  existing: MappingProperty<TSource, TDestination>
) => {
  if ((property.destinationPropertyName as string) ===
    (property.sourcePropertyName as string) ||
    property.sourcePropertyName ===
    existing.sourcePropertyName) {
    return false
  }

  existing.name = property.name
  existing.sourcePropertyName = property.sourcePropertyName

  return true
}
