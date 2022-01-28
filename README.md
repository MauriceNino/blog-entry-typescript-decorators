# TypeScript Decorators and why you should use them!

If you are coming from a Java Background, you are most definitely familiar with the concept of `Annotation`'s.
They are used to provide metadata to a Class/Method/Property and in a further step even functionality.

JavaScript features a similar concept called `Decorators`.
These are currently a part of the `ESlatest` specification, which consists of experimental features that are not implemented by current browsers yet.
You can track the progress on the proposal on the [official GitHub repository](https://github.com/tc39/proposal-decorators).

Even though the current generations of browsers cannot understand Decorators, you can still use them through the magic of TypeScript!
Although this is still only in experimental support in TypeScript too, don't be hesitant to use these features, as it is already an industry standard and frameworks like `Angular` heavily depend on them.

## Technical Details

- Fundamentally, a decorator is just a normal method with specific parameters
- They can be applied to Classes, Properties, Methods, Accessors and Parameters
- Multiple decorators can be applied to the same target and will be evaluated one after the other (so order matters)
- You can also add metadata using an extra node package

## Introduction

To get started, all you need to do is enable the `experimentalDecorators` flag in your `tsconfig.json`.
This option is opt-in and not enabled by default, unless you are using a framework like Angular which already enables it by default.

When this flag is enabled you can use decorators all over your project without any further import statements. To show you what you can do with this power, lets have a look at this small example, which wraps a class method and prints `"Hello"` whenever that said method is called:

```ts
const log = (
  target: (new () => Test) | Test, // The constructor of the applied class (for static methods) or prototype (for non-static)
  propertyKey: string, // The name of the applied property in the class
  descriptor: PropertyDescriptor // Describes the value of the applied property
) => {
  // Save the given property value
  const original = descriptor.value;

  // Intercept the given property value
  descriptor.value = function () {
    console.log("Hello");
    original();
  };

  // Return the descriptor with the new property value
  return descriptor;
};
```

This decorator can now be applied to any method, like in the following snippet:

```ts
class Test {
  @log
  public static method() {
    console.log("World");
  }
}

Test.method();
// => Hello
//    World
```

## Class vs. Property vs. Method/Accessor vs. Parameter decorators

There are some minor, but important differences between the various decorator types, which you must know if you want to use them (but don't worry, you can always look this information up online, or locally in the type definitions).

They mainly differ in the parameters passed into the decorator. For example a class decorator only has access to the given class (the target), while a property decorator also has access to the property key.

To get a quick glance of the 4 different decorator types, I have created this little snippet:

```ts
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
```

If you are interested in the exact types of them, I have listed them here as well, but as I already mentioned you can always look them up in your local type definitions.

```ts
// Types form the official TypeScript library (https://github.com/microsoft/TypeScript/blob/912c01a2a69fdba4a30e508048f8b18517e90f04/lib/lib.es5.d.ts#L1426-L1429)
// Every decorator needs to be assignable to one of those 4 types
type ClassDecorator = <T extends Function>(target: T) => T | void;

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
```

## Parameters

As decorators are nothing more than function references, you can easily utilize the factory pattern, while leveraging [JavaScripts closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) to create parametrized decorators.

```ts
// This is a function that returns a MethodDecorator
// The passed variable "logLevel" is accessible from inside the returned decorator
// thanks to JavaScripts closures
const log = (logLevel: "log" | "warn" | "error"): MethodDecorator => {
  console.log("Init with logLevel:", logLevel);

  return (_, _2, descriptor: PropertyDescriptor) => {
    const originalValue = descriptor.value!;

    descriptor.value = () => {
      console[logLevel]("Method called");
      originalValue();
    };

    return descriptor;
  };
};

class Test {
  @log("error")
  public static method() {}
}

Test.method();
Test.method();
// => Init with logLevel: error
//    Method called
//    Method called
```

## Metadata

There is one problem with decorators that makes them different to what you might have expected from Java - they don't provide any metadata to the applied method.
That means, you cannot simply read the applied decorators of a property.

But there is a possibility to bring back some of those features by enabling another flag in the `tsconfig.json` - `emitDecoratorMetadata`.
Once enabled, decorators emit some metadata to every field. Lets have a look at the compiled output of the last example:

<table>
<tr>
<td> Before </td> <td> After </td>
</tr>
<tr>
<td>

```js
class Test {
  static method() {}
}
__decorate([log("error")], Test, "method", null);
```

</td>
<td>

```js
class Test {
  static method() {}
}
__decorate(
  [
    log("error"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0),
  ],
  Test,
  "method",
  null
);
```

</td>
</tr>
</table>

### Custom Metadata

But to really leverage the metadata API, you can install the node package [`reflect-metadata`](https://github.com/rbuckton/reflect-metadata).
This package works flawlessly with TypeScripts decorator and metadata capabilities and adds the capabilities to add custom metadata which is then readable and even queryable!

Lets look how you can use the package with a small example:

```ts
import "reflect-metadata"; // You need to import the library once

class Test {
  @Reflect.metadata("magic", 42) // Then you can use the decorators
  static text = "The magic number is: ";

  static doSomething() {
    // Then you can check if a property has some metadata
    // Keep in mind, that design metadata is also queried
    // e.g. "design:type", "design:paramtypes", etc.
    const metadataKeys = Reflect.getOwnMetadataKeys(Test, "text");

    // And then read from that metadata key
    // Note: in this example we directly access [1],
    // because we know there is only a single metadata property specified
    // and the first one is the design:type metadata
    const magicNumber = Reflect.getMetadata(metadataKeys[1], Test, "text");

    console.log(Test.text + magicNumber);
  }
}

Test.doSomething();
// => The magic number is: 42
```

## Conclusion

TypeScript decorators (and hopefully in the near future "JavaScript decorators"), are a great tool for mainly interceptor type functionality, but can also be used for much more with a bit of tinkering.

They are broadly adapted and heavily used by some of the biggest frameworks, like Angular. So if you are working in a TypeScript environment, and there are some use-cases for you (e.g. a custom performance logger, or a permissions check for backend methods) don't be afraid of using them.

In case you want to have a look at, or tinker with the examples from this blog entry, you can clone this entire article, with the examples included (as a node package) from GitHub: <https://github.com/MauriceNino/blog-entry-typescript-decorators>

## Links

| Description                                             | Link                                                                                   |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Official Handbook on decorators                         | <https://www.typescriptlang.org/docs/handbook/decorators.html>                         |
| A more elaborate tutorial on every aspect of decorators | <https://www.digitalocean.com/community/tutorials/how-to-use-decorators-in-typescript> |
| reflect-metadata repository                             | <https://github.com/rbuckton/reflect-metadata>                                         |
