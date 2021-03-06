var calculatorApp = angular.module('calcApp', []);

calculatorApp.factory('calculatorFactory', function () {
  var calculator = {};
  var buffer = []; // all digits get stored here before being passed on for manipulation
  var stored_value = 0; // the sum of all operations 
  var initial_clean = true;
  var previous_operation;
  var screen = 0;
  var accept_input = true;
  var initial_sqrt = false;
  var sign = 1; // 1 = positive; -1 = negative


  calculator.getScreen = function () {
    // screen has to display buffer until an operation is used, then display the result of that operation
    return screen;
  };

  calculator.pushToBuffer = function (digit) {
    // every time a calculator button is pressed push its corresponding value onto the buffer
    if (accept_input) {
      buffer.push(digit);
    } 
  };

  calculator.setPreviousOperation = function (operation) {
    previous_operation = operation;
  };

  calculator.getPreviousOperation = function () {
    return previous_operation;
  };

  calculator.setAcceptInput = function (value) {
    accept_input = value;
  };

  calculator.getAcceptInput = function () {
    return accept_input;
  };

  calculator.flipSign = function () {
    // this will flip between 1 and -1 for positive and negative  
    sign *= -1;
  };

  calculator.flushBuffer = function () {
    // after an operation is used (+,-,etc) flush everything from the buffer onto a stored value for later manipulation
    // flushing the buffer means turning the array into a string and then returning it as a number and clearing it
    // if buffer is empty we dont want to return an empty value that will turn into 0
    var ready_to_use_buffer = "";
    if (buffer.length > 0) {
      buffer.forEach(function (value) {
          ready_to_use_buffer += value;
      });
      console.log("the ready to use buffer is: " + ready_to_use_buffer);
      buffer = [];
      return Number(ready_to_use_buffer);
    }
    else return null;
  };

  calculator.performOperation = function (operation) {
    // perform the passed in operation (add/sub/div/mult) 
    if (!initial_clean) {
      // if there is something already stored, run the operation on it & whatever is in the buffer
      console.log("Initial is not clean");
      var tmp_flushed_buffer = calculator.flushBuffer();
      // even if the number is not negative its converting, need a way to track
      // positive numbers
      // this turns the nell into 0 causing a out of range error
      if (tmp_flushed_buffer !== null) {
        tmp_flushed_buffer *= sign;
        stored_value = previous_operation(stored_value, tmp_flushed_buffer);
      }
      else if (initial_sqrt) {
        tmp_flushed_buffer *= sign;
        stored_value = operation(stored_value, tmp_flushed_buffer);
        // so that this only runs once
        initial_sqrt = false;
      }
        calculator.setPreviousOperation(operation);
        console.log(operation);
        console.log("factory stored value: " + stored_value);
      
    } else {
      // this runs when initial is clean
      console.log("Initial is clean");
      console.log("should have flushed");
      var tmp_flushed_buffer2 = calculator.flushBuffer();
      // if operations are randomly being clicked without input do nothing
      if (stored_value === 0 && tmp_flushed_buffer2 === null) return 0;
      // this is just to 'chamber a function'
      calculator.setPreviousOperation(operation);
      // nothing to flush atm causing stored_value to be null
      stored_value = tmp_flushed_buffer2;
      stored_value *= sign;
      if (operation !== calculator.equalsOperation)
        initial_clean = false;
    }
    // reset the sign back to positive
    sign = 1;
    return stored_value;
  };

  calculator.equalsOperation = function (a, b) {
    // when you hit equals you will want to run the previous operation 
    // ex: 2 + 2 ; when you = you want the + to run
    // current bug passing this twice will cause a Maximum call stack error
    return previous_operation(a, b);
  };

  calculator.addOperation = function (a, b) {
    return a + b;
  };
  calculator.subtractOperation = function (a, b) {
    return a - b;
  };
  calculator.divideOperation = function (a, b) {
    // you can't divide by zer0 silly
    if (b !== 0)
        return a / b;
    else {
      console.log("You can't divide by 0");
      return null;
    }
  };
  calculator.multiplyOperation = function (a, b) {
    console.log("I am multiplying " + a + ", " + b);
    return a * b;
  };

  calculator.C = function () {
    buffer = [];
  };

  calculator.CE = function () {
    buffer = [];
    stored_value = 0;
    initial_clean = true;
  };

  calculator.squareRoot = function () {
    // literally just a wrapper for the sqrt function
    if (stored_value !== 0) stored_value = Math.sqrt(stored_value);
    else {
      stored_value = Math.sqrt(calculator.flushBuffer());
      initial_sqrt = true;
      initial_clean = false;
    }
  };

  calculator.returnValue = function () {
    return stored_value;
  };


  return calculator;
});

calculatorApp.controller('bodyController', ['calculatorFactory', function (calculatorFactory) {

  var self = this;
  self.init = function () {
  };

  self.screen = "0"; // what to display on the calc screen
  self.performing_operation = false;

  self.catchValue = function (value) {
    // verify that whats being passed is a number if so push it to the buffer it not discard it
    if (typeof value === 'number') {
      calculatorFactory.pushToBuffer(value);
      self.screenHandler(value);
    } else {
      // if the user was to edit the value being passed in the application
      console.log("Invalid type");
    }

  };

  // function for testing purposes
  self.displayTheBuffer = function () {
    calculatorFactory.flushBuffer();
  };

  self.screenHandler = function (value) {
    // if you have clicked an operation we dont want to append we want to replace the screen with a new buffer
    if (calculatorFactory.getAcceptInput()) {
      if (self.performing_operation) {
        self.performing_operation = false;
        self.screen = "0";
      }
      // if we are at the beggining of the oparation do not append
      if (self.screen.charAt(0) === "0") self.screen = value.toString();
      else self.screen += value.toString();
    }
  };

  self.multiply = function (a, b) {
    console.log("screen is: " + self.screen);
    console.log("stored value is: " + calculatorFactory.returnValue());
    self.screen = calculatorFactory.performOperation(calculatorFactory.multiplyOperation).toString();
    self.performing_operation = true;
    calculatorFactory.setAcceptInput(true);
  };

  self.divide = function (a, b) {
    self.screen = calculatorFactory.performOperation(calculatorFactory.divideOperation).toString();
    self.performing_operation = true;
    calculatorFactory.setAcceptInput(true);
  };

  self.add = function () {
    self.screen = calculatorFactory.performOperation(calculatorFactory.addOperation).toString();
    self.performing_operation = true;
    calculatorFactory.setAcceptInput(true);
  };

  self.subtract = function (a, b) {
    self.screen = calculatorFactory.performOperation(calculatorFactory.subtractOperation).toString();
    self.performing_operation = true;
    calculatorFactory.setAcceptInput(true);
  };

  self.sqrRoot = function () {
    calculatorFactory.squareRoot();
    self.screen = calculatorFactory.returnValue();
  };

  self.signHandler = function () {
    self.screen *= -1;
    calculatorFactory.flipSign();
  };

  self.equals = function () {
    self.screen = calculatorFactory.performOperation(calculatorFactory.equalsOperation).toString();
    self.performing_operation = false;
    calculatorFactory.setAcceptInput(false);
  };

  self.clearCurrent = function () {
    calculatorFactory.C();
    self.screen = "0";
  };

  self.clearEverything = function () {
    calculatorFactory.CE();
    self.screen = "0";
    self.performing_operation = false;
    calculatorFactory.setAcceptInput(true);
  };

  self.init();
    
}]);


