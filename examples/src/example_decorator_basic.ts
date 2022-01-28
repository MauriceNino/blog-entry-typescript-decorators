export {};

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

class Test {
  @log
  public static method() {
    console.log("World");
  }
}

Test.method();
// => Hello
//    World
