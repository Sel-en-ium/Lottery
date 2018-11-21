/*jslint node: true*/
(function () {
  'use strict';

  var
    fse = require('fs-extra'),
    rand = require('./../lib/seedrandom'),
    Lottery;

  Lottery = function (config) {
    config = config || {};
    this.seed = config.seed || "";
    this.setLength = config.setLength || 6;
    this.minNum = config.minNum || 1;
    this.maxNum = config.maxNum || 49;
    this.numberAcceptanceRate = config.numberAcceptanceRate || {};
    this.maxTries = this.maxNum - this.min + 1;

    Math.seedrandom(this.seed);
  };

  /**
   * @param {Int} create - Number of sets to generate
   * @param {Array of Int} fixedNums - The fixed numbers to include in each generation.
   * @param {Array of Array of Int} existingSets (optional) - Existing sets of numbers, 
   *        to make sure we don't create duplicates.
   * @returns {Array of Array of Int} - The existingSets with the new sets appended.
   */
  Lottery.prototype.generateSets = function (create, existingSets) {
    var
      self = this;

    return self.generateSetsWithFixedNums(create, [], existingSets);
  };

  /**
   * @param {Int} create - Number of sets to generate
   * @param {Array of Int} fixedNums (optional) - The fixed numbers to include in each 
   *        set generation.
   * @param {Array of Array of Int} existingSets (optional) - Existing sets of numbers, 
   *        to make sure we don't create duplicates.
   * @returns {Array of Array of Int} - The existingSets with the new sets appended.
   */
  Lottery.prototype.generateSetsWithFixedNums = function (create, fixedNums, existingSets) {
    existingSets = existingSets || [];
    fixedNums = fixedNums || [];
    fixedNums.sort(function(a, b){return a - b;});
    
    var
      self = this,
      fixLen = fixedNums.length,
      newSet,
      num;

    for (var i = 0; i < create; i++) {
      // Try to create a set until we get a unique one.
      do {
        newSet = fixedNums.slice(0);
        for (var j = fixLen; j < self.setLength; j++) {
          num = self.generateNum(newSet);
          newSet.push(num);
        }
        newSet.sort(function(a, b){return a - b;});
      } while (self.setExists(newSet, existingSets));

      // Add the set
      existingSets.push(newSet);
    }

    self.sortSets(existingSets);

    return existingSets;
  };

  /**
   * Assumes each set is internally sorted.
   * @returns {boolean} - true if set is in existingSets
   */
  Lottery.prototype.setExists = function (set, existingSets) {
    var
      self = this;
    
    for (var i = 0; i < existingSets.length; i++) {
      for (var j = 0; j < self.setLength + 1; j++) {
        if (j == self.setLength) {
          return true;
        }
        if (set[j] != existingSets[i][j]) {
          break;
        }
      }
    }
    return false;
  }

    /**
   * @returns {boolean} - true if set is in existingSets
   */
  Lottery.prototype.sortSets = function (sets) {
    var
      self = this;

    // Sort each internal set  
    for (var i = 0; i < sets.length; i++) {
      sets[i].sort(function(a, b){return a - b;});
    }

    // Sort the order of the sets
    sets.sort(function(a, b){
      for (var i = 0; i < self.setLength; i++) {
        if (a[i] != b[i]) {
          return a[i] - b[i];
        }
      }
      self.printSets(sets);
      throw new Error("Duplicate sets found!\n");
    });

  }

  Lottery.prototype.printSets = function (sets) {
    var
      self = this,
      set;
    
    for (var i = 0; i < sets.length; i++) {
      set = "";
      for (var j = 0; j < self.setLength; j++) {
        set += (" " + sets[i][j]).slice(-2) + " "
      }
      console.log(set);
    }
  }

  /**
   * @returns {String} - The csv string
   */
  Lottery.prototype.generateCsv = function (sets, file) {
    var
      self = this,
      rows = [];

    for (var i = 0; i < sets.length; i++) {
        for (var j = 0; j < self.setLength; j++) {
          sets[i][j] = '\"' + sets[i][j] + '\"';  // Quote for safety
        }
        rows.push(sets[i].join(','));
    }

    return rows.join('\r\n');
  }

  /**
   * @param {Array of Int} invalidNumbers (optional) - Numbers that the generator cannot return.
   * @returns {Int} - A random int in the defined range
   */
  Lottery.prototype.generateNum = function (invalidNumbers, tries) {  
    var
      self = this,
      tries = tries || 0,
      num;

      num = Math.random() * (self.maxNum - self.minNum + 1)
      num = Math.floor(num)  + self.minNum;

      // If we exceeded tries
      if (tries > self.maxTries) {
        // Try the generateValidNum
        return self.generateValidNum(num, invalidNumbers);
      }

      // Should we not use the number? (according to acceptance rate)
      // Or is the number in invalidNumbers?
      var useNumber = Math.random();
      if ( 
        useNumber >= (self.numberAcceptanceRate[num] || 1) 
        || invalidNumbers.includes(num) 
      ) {
        return self.generateNum(invalidNumbers, tries + 1);
      }

      return num;
  };

    /**
   * @param {Int} startNum - start number
   * @param {Array of Int} invalidNumbers (optional) - Numbers that the generator cannot return.
   * @returns {Int} - A random int in the defined range
   */
  Lottery.prototype.generateValidNum = function (startNum, invalidNumbers) {  
    var
      self = this,
      num;

      increment = Math.random() >= 0.5

      // Just try all the numbers, either going up or down
      for (var i = 0; i < self.maxNum - self.minNum + 1; increment? i++ : i--) {
        if (!invalidNumbers.includes(num)) {
          return num;
        }
        num++;
      }

      throw new Error("No valid numbers to be found outside invalidNumbers: " + invalidNumbers)
  };

  module.exports = Lottery;

}());