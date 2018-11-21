/*jslint node: true*/
(function () {
  'use strict';

  var
    fse = require('fs-extra'),
    Lottery = require('./js/numberPicker'),
    lottery = new Lottery();

  
  fse.readJson("./data/myNumberPickedRate.json", function (err, numberAcceptanceRate) {
    if (err) {
      return console.log(err);
    }


    lottery = new Lottery({
      "numberAcceptanceRate": numberAcceptanceRate,
      "seed": "469 384849 214"
    })

    // var results = lottery.generateSetsWithFixedNums(22, [45]);
    var existingSets = [
      [7,13,14,21,27,44],
      [2,3,22,26,34,35],
      [3,6,27,36,44,45],
      [2,4,22,23,39,48],
      [3,9,33,36,38,40],
      [5,10,11,21,28,49],
      [1,8,12,13,27,35],
      [3,29,31,43,44,45]
    ];
    var results = lottery.generateSets(10)
  
    lottery.printSets(results);

    var csv = lottery.generateCsv(results);
    fse.writeFile("./output.csv", csv, function(err) {
      if (err) {
        return console.log(err);
      }
    });
    
  
    console.log("done");
  });


}());