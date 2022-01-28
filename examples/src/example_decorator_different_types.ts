export {};

// Types form the official typescript library (https://github.com/microsoft/TypeScript/blob/912c01a2a69fdba4a30e508048f8b18517e90f04/lib/lib.es5.d.ts#L1426-L1429)
// Every decorator needs to be assignable to one of those 4 types
declare type ClassDecorator = <TFunction extends Function>(
  target: TFunction
) => TFunction | void;
declare type PropertyDecorator = (
  target: Object,
  propertyKey: string | symbol
) => void;
declare type MethodDecorator = <T>(
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
declare type ParameterDecorator = (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) => void;

const methodDecorator: MethodDecorator = (target, propertyKey, descriptor) => {
  // target = if static method: constructor of applied class
  //          if instance method: prototype of applied class
  // propertyKey = name of the method
  // descriptor = metadata of member (value, accessors, enumerable, ...)

  return descriptor;
};

const propertyDecorator: PropertyDecorator = (target, propertyKey) => {
  // target = if static property: constructor of applied property,
  //          if instance property: prototype of applied property
  // propertyKey = name of the property
};

const classDecorator: ClassDecorator = (target) => {
  // target = if static property: constructor of applied property,
};

const parameterDecorator: ParameterDecorator = (
  target,
  propertyKey,
  parameterIndex
) => {
  // target = if static method: constructor of applied method parameter,
  //          if instance method: prototype of applied method parameter
  // propertyKey = name of the method parameter
  // parameterIndex = ordinal index of the parameter in the arguments list
};

@classDecorator
class Test {
  @propertyDecorator
  private _property: string = "";

  @methodDecorator
  public method(@parameterDecorator parameter: string) {
    console.log(`${this._property} ${parameter} World!`);
  }

  @methodDecorator // method decorator can be applied to accessor
  set property(value: string) {
    this._property = value;
  }
}

const test = new Test();
test.property = "Hello";
test.method("beautiful");
// => Hello beautiful World!
