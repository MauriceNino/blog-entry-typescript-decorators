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
