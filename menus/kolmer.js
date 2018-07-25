"use strict";

var request = require('request');
var cheerio = require('cheerio');
var currentWeekNumber = require('current-week-number');
var PDFParser = require('pdf2json');
var mittag = require('../util/mittagat.js')

module.exports = {
    intent: /.*restaurant-kolmer.*/i,
    location: "linz",
    getMenu: (callback) => mittag.menu(callback, "restaurant-kolmer-parkbad")
};