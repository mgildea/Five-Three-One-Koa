const { google } = require("googleapis");
const sheets = google.sheets("v4");
const authorize = require("./googleOAuth");

const { promisify } = require("util");

sheets.spreadsheets.create[promisify.custom] = (request) => {
	return new Promise((resolve, reject) => {
		sheets.spreadsheets.create(request, (err, response) => {
			if (err) return reject(err);
			return resolve(response);
		});
	});
};
const publish = promisify(sheets.spreadsheets.create);

const Border = () => {
	return {
		style: "SOLID",
		color: {
			alpha: 1
		}
	};
};

const Borders = (top, bottom, left, right) => {
	return {
		...(top && { top: Border() }),
		...(bottom && { bottom: Border() }),
		...(left && { left: Border() }),
		...(right && { right: Border() })
	};
};

const SetHeaders = (day, i) => {
	return [
		{
			values: [
				{
					userEnteredValue: {
						stringValue: "Day " + (i + 1)
					},
					userEnteredFormat: {
						horizontalAlignment: "CENTER",
						backgroundColor: {
							red: 0.72,
							green: 0.72,
							blue: 0.72,
							alpha: 1
						},
						borders: Borders(true, true, true, true)
					}
				}
			]
		},
		{
			values: [
				{
					userEnteredValue: {
						stringValue: "Movement"
					},
					userEnteredFormat: {
						horizontalAlignment: "CENTER",
						backgroundColor: {
							red: 0.8,
							green: 0.8,
							blue: 0.8,
							alpha: 1
						},
						borders: Borders(false, true, true, false)
					}
				},

				{
					userEnteredValue: {
						stringValue: day.movement
					},
					userEnteredFormat: {
						textFormat: {
							bold: true
						},
						horizontalAlignment: "CENTER",
						backgroundColor: {
							red: 0.8,
							green: 0.8,
							blue: 0.8,
							alpha: 1
						},
						borders: Borders(false, true, false, true)
					}
				}
			]
		},
		{
			values: [
				{
					userEnteredValue: {
						stringValue: "Percent"
					},
					userEnteredFormat: {
						horizontalAlignment: "CENTER",
						backgroundColor: {
							red: 0.93,
							green: 0.93,
							blue: 0.93,
							alpha: 1
						},
						borders: Borders(false, true, true, false)
					}
				},
				{
					userEnteredValue: {
						stringValue: "Weight"
					},
					userEnteredFormat: {
						horizontalAlignment: "CENTER",
						backgroundColor: {
							red: 0.93,
							green: 0.93,
							blue: 0.93,
							alpha: 1
						},
						borders: Borders(false, true, false, false)
					}
				},
				{
					userEnteredValue: {
						stringValue: "Target Reps"
					},
					userEnteredFormat: {
						horizontalAlignment: "CENTER",
						backgroundColor: {
							red: 0.93,
							green: 0.93,
							blue: 0.93,
							alpha: 1
						},
						borders: Borders(false, true, false, false)
					}
				},
				{
					userEnteredValue: {
						stringValue: "Total Reps"
					},
					userEnteredFormat: {
						horizontalAlignment: "CENTER",
						backgroundColor: {
							red: 0.93,
							green: 0.93,
							blue: 0.93,
							alpha: 1
						},
						borders: Borders(false, true, false, true)
					}
				}
			]
		}
	];
};

const Sets = (sets, day, week) => {
	return sets.map((set, i) => {
		return {
			values: [
				{
					userEnteredValue: {
						numberValue: set.percent
					},
					userEnteredFormat: {
						numberFormat: {
							type: "PERCENT",
							pattern: "##%"
						},
						horizontalAlignment: "CENTER",
						borders: Borders(false, i === sets.length - 1, true, false)
					}
				},

				{
                    userEnteredValue : {
                        formulaValue : "=INDEX(Maxes,MATCH(Week_" + week + "_DAY_" + day + "_MOVEMENT,Movements),0) * INDEX(Week_" + week + "_DAY_" + day + "_PERCENTAGES," + (i+1) + ",1)"
                    },
                    
					userEnteredFormat: {
						numberFormat: {
							type: "NUMBER"
						},
						horizontalAlignment: "CENTER",
						borders: Borders(false, i === sets.length - 1, false, false)
					}
				},
				{
					userEnteredValue: {
						numberValue: set.reps
					},
					userEnteredFormat: {
						numberFormat: {
							type: "NUMBER"
						},
						horizontalAlignment: "CENTER",
						borders: Borders(false, i === sets.length - 1, false, false)
					}
				},
				{
					userEnteredFormat: {
						numberFormat: {
							type: "NUMBER"
						},
						horizontalAlignment: "CENTER",
						borders: Borders(false, i === sets.length - 1, false, true)
					}
				}
			]
		};
	});
};

const DayStartRow = (i, days) => {
	//TODO use number of sets per day to determine start row; right now this assumes there are only 3 sets
	return 8 * i + 2;
};

const SheetMerges = (days, sheetId) => {
	let arr = [];

	days.forEach((day, i) => {
		let startRow = DayStartRow(i);
		arr.push({
			sheetId: sheetId,
			startRowIndex: startRow,
			endRowIndex: startRow + 1,
			startColumnIndex: 0,
			endColumnIndex: 4
		});

		arr.push({
			sheetId: sheetId,
			startRowIndex: startRow + 1,
			endRowIndex: startRow + 2,
			startColumnIndex: 1,
			endColumnIndex: 4
		});
	});

	return arr;
};

const Days = (days, week) => {
	return days.map((day, i) => {
		return {
			startRow: DayStartRow(i, days),
			startColumn: 0,
			rowData: SetHeaders(day, i).concat(Sets(day.sets, i+1, week))
		};
	});
};

// const ProtectedRanges = (days, sheetId) => {
//     let arr = [];

//     days.forEach((day, i) => {
//         let startRow = DayStartRow(i);
//         arr.push({
//             range : {
//                 sheetId: sheetId,
//                 startRowIndex: startRow,
//                 endRowIndex: startRow + 3,
//                 startColumnIndex: 0,
//                 endColumnIndex: 4
//             }
//         });

//         arr.push({
//             range : {
//                 sheetId: sheetId,
//                 startRowIndex: startRow + 3,
//                 endRowIndex: startRow + 6,
//                 startColumnIndex: 0,
//                 endColumnIndex: 3
//             }
//         });
//     });

//     return arr;
// }

// const ConditionalFormats = (week, sheetId) => {
// 	let arr = [];

// 	days.forEach((day, i) => {
// 		let startRow = DayStartRow(i);
// 		arr.push({
// 			range: {
// 				sheetId: sheetId,
// 				startRowIndex: startRow + 3,
// 				endRowIndex: startRow + 4,
// 				startColumnIndex: 3,
// 				endColumnIndex: 4
// 			},
// 			booleanRule: {
// 				condition: {
// 					type: "NUMBER_GREATER_THAN_EQ"
// 				},
// 				format: {
// 					textFormat: {
// 						foregroundColor: {
// 							green: 1
// 						}
// 					}
// 				}
// 			}
// 		});
// 	});

// 	return arr;
// };


const WeeksRanges = (weeks) => {
    let arr = [];

    weeks.forEach((week, i) => {
        week.days.forEach((day, j) => {
            let startRow = DayStartRow(j, week.days);
            arr.push({
                name: "Week_" + (i+1) + "_DAY_" + (j+1) + "_MOVEMENT",
                range: {
                    sheetId: i+1,
                    startRowIndex: startRow +1 ,
                    endRowIndex: startRow + 2,
                    startColumnIndex: 1,
                    endColumnIndex: 2
                }
            });

            arr.push({
                name: "Week_" + (i+1) + "_DAY_" + (j+1) + "_PERCENTAGES",
                range: {
                    sheetId: i+1,
                    startRowIndex: startRow +3 ,
                    endRowIndex: startRow + 3 + day.sets.length,
                    startColumnIndex: 0,
                    endColumnIndex: 1
                }
            })
        })
    });

    return arr;
}


const Weeks = (weeks) => {
	return weeks.map((week, i) => {
		return {
			properties: {
				sheetId: i + 1,
				title: "Week " + (i + 1),
				tabColor: {
					red: 1.0
				}
			},

			data: Days(week.days, i + 1),
			merges: SheetMerges(week.days, i + 1)
			//protectedRanges : ProtectedRanges(week.days, i+1)
			//conditionalFormats: ConditionalFormats(week.days, i+1)
		};
	});
};

const MaxesHeaders = () => {
	return [
		{
			startRow: 1,
			startColumn: 0,
			rowData: [
				{
					values: [
						{
							userEnteredValue: {
								stringValue: "Movement"
							},
							userEnteredFormat: {
								horizontalAlignment: "CENTER",
								backgroundColor: {
									red: 0.8,
									green: 0.8,
									blue: 0.8,
									alpha: 1
								},
								borders: Borders(true, true, true, false)
							}
						},
						{
							userEnteredValue: {
								stringValue: "1 Rep Max"
							},
							userEnteredFormat: {
								horizontalAlignment: "CENTER",
								backgroundColor: {
									red: 0.8,
									green: 0.8,
									blue: 0.8,
									alpha: 1
								},
								borders: Borders(true, true, false, false)
							}
						},
						{
							userEnteredValue: {
								stringValue: "Calculated 1 Rep Max"
							},
							userEnteredFormat: {
								horizontalAlignment: "CENTER",
								backgroundColor: {
									red: 0.8,
									green: 0.8,
									blue: 0.8,
									alpha: 1
								},
								borders: Borders(true, true, false, true)
							}
						}
					]
				}
			]
		}
	];
};

const OneRepMaxes = (movements) => {
	return MaxesHeaders().concat(
		movements.map((movement, i) => {
			return {
				startRow: i + 2,
				startColumn: 0,
				rowData: [
					{
						values: [
							{
								userEnteredValue: {
									stringValue: movement
								},
								userEnteredFormat: {
									borders: Borders(
										false,
										i === movements.length - 1,
										true,
										false
									)
								}
							},
							{
								userEnteredValue: {
									numberValue: 0
								},
								userEnteredFormat: {
									horizontalAlignment: "CENTER",
									borders: Borders(
										false,
										i === movements.length - 1,
										false,
										false
									)
								}
							},
							{
								userEnteredFormat: {
									horizontalAlignment: "CENTER",
									borders: Borders(
										false,
										i === movements.length - 1,
										false,
										true
									)
								}
							}
						]
					}
				]
			};
		})
	);
};

const Maxes = (movements) => {
	return {
		properties: {
			sheetId: 0,
			title: "1 REP MAXES",
			tabColor: {
				red: 1.0
			}
		},
		data: OneRepMaxes(movements)
	};
};



const MaxesRanges = (movements) => {
	return [
		{
			name: "Movements",
			range: {
				sheetId: 0,
				startRowIndex: 2,
				endRowIndex: movements.length + 2,
				startColumnIndex: 0,
				endColumnIndex: 1
			}
		},

		{
			name: "Maxes",
			range: {
				sheetId: 0,
				startRowIndex: 2,
				endRowIndex: movements.length + 2,
				startColumnIndex: 1,
				endColumnIndex: 2
			}
		}
	];
};

const SpreadSheet = async (template) => {
	let authClient = await authorize();

	let request = {
		resource: {
			properties: {
				title: "My 5-3-1 Program"
			},
			sheets: [Maxes(template.movements)].concat(Weeks(template.weeks)),
			namedRanges: MaxesRanges(template.movements).concat(WeeksRanges(template.weeks))
		},
		auth: authClient
	};

	let response;
	try {
		response = await publish(request);
	} catch (err) {
		console.log(err);
		return err.message;
	}

	return {
		spreadsheetUrl: response.data.spreadsheetUrl,
		title: response.data.properties.title
	};
};

module.exports = SpreadSheet;
