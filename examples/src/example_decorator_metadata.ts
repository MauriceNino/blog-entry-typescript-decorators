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
