"use strict";

const { PdfReader } = require("pdfreader");

function readPDFPages(buffer, reader = new PdfReader()) {
  return new Promise((resolve, reject) => {
    let pages = [];
    reader.parseBuffer(buffer, (err, item) => {
      if (err) {
        console.log("erro", err);
        reject(err);
      } else if (!item) {
        resolve(pages);
      } else if (item.page) pages.push({});
      else if (item.text) {
        const row = pages[pages.length - 1][item.y] || [];
        row.push(item.text);
        pages[pages.length - 1][item.y] = row;
      } else {
        //console.debug('teste 1');
      }
    });
  });
}

function parseLinkedin(pages) {
  const parseObj = {
    searchPageValue: [
      /Page 1 of/i,
      /Page 2 of/i,
      /Page 3 of/i,
      /Page 4 of/i,
      /Page 5 of/i,
      /Page 6 of/i,
    ],
    searchInitValue: ["Experience", "Experiência"],
    searchEndValue: ["Education", "Formação acadêmica"],
    searchMonth: [
      /January/i,
      /February/i,
      /March/i,
      /April/i,
      /May/i,
      /June/i,
      /July/i,
      /August/i,
      /September/i,
      /October/i,
      /November/i,
      /December/i,
      /janeiro/i,
      /fevereiro/i,
      /março/i,
      /abril/i,
      /maio/i,
      /junho/i,
      /julho/i,
      /agosto/i,
      /setembro/i,
      /outubro/i,
      /novembro/i,
      /dezembro/i,
    ],
    searchYearValue: [/years/i, /year/i, /anos/i, /ano/i],
    searchDot: [/./i],
    fields: {
      company: { index: 0 },
      role: { index: 1 },
      date: { index: 2 },
      location: { index: 3 },
      //description: { index: 4 },
      //description2: { index: 5 },
    },
  };

  const keys = Object.keys(parseObj.fields);
  let list = [];
  let experienceFlag = false;
  let experienceDescriptionFlag = false;
  let experienceCityFlag = false;
  let experienceInsideFlag = false;
  let counter = 0;
  let descriptionCounter = 0;
  let dataDescr = [];
  let valCompanyAux;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    for (let row in page) {
      if (row.length > 0) {
        if (
          page[row].join("").search(parseObj.searchInitValue[0]) >= 0 ||
          page[row].join("").search(parseObj.searchInitValue[1]) >= 0
        ) {
          //console.log("page[row]: ", page[row]);
          let pageRowLength = parseInt(page[row][0].length);

          if (pageRowLength === 10 || pageRowLength === 11) {
            experienceFlag = true;
          }
        } else if (experienceFlag) {
          if (
            page[row].join("").search(parseObj.searchPageValue[0]) >= 0 ||
            page[row].join("").search(parseObj.searchPageValue[1]) >= 0 ||
            page[row].join("").search(parseObj.searchPageValue[2]) >= 0 ||
            page[row].join("").search(parseObj.searchPageValue[3]) >= 0 ||
            page[row].join("").search(parseObj.searchPageValue[4]) >= 0 ||
            page[row].join("").search(parseObj.searchPageValue[5]) >= 0
          ) {
            continue;
          } else {
            if (
              page[row].join("").search(parseObj.searchEndValue[0]) >= 0 ||
              page[row].join("").search(parseObj.searchEndValue[1]) >= 0
            ) {
              experienceFlag = false;
            } else {
              if (experienceCityFlag) {
                let dataRow = {};

                if (dataDescr.length === 2) {
                  dataRow[keys[0]] = valCompanyAux;
                  const valRole = dataDescr[0];
                  dataRow[keys[1]] = valRole[0];
                  const valDate = dataDescr[1];
                  dataRow[keys[2]] = valDate[0];
                  const valLocation = page[row];
                  dataRow[keys[3]] = valLocation[0];
                  experienceInsideFlag = false;
                } else {
                  let valCompany = dataDescr[descriptionCounter - 3];
                  if (valCompany[0].length > 30) {
                    dataRow[keys[0]] = valCompanyAux;
                  } else {
                    dataRow[keys[0]] = valCompany[0];
                  }
                  const valRole = dataDescr[descriptionCounter - 2];
                  dataRow[keys[1]] = valRole[0];
                  const valDate = dataDescr[descriptionCounter - 1];
                  dataRow[keys[2]] = valDate[0];
                  const valLocation = page[row];
                  if (valLocation[0].length > 40) {
                    dataRow[keys[3]] = "";
                  } else {
                    dataRow[keys[3]] = valLocation[0];
                  }

                  if (experienceInsideFlag) {
                    dataRow[keys[0]] = valCompanyAux;
                    experienceInsideFlag = false;
                  }

                  if (
                    valCompany.join("").search(parseObj.searchYearValue[0]) >=
                      0 ||
                    valCompany.join("").search(parseObj.searchYearValue[1]) >=
                      0 ||
                    valCompany.join("").search(parseObj.searchYearValue[2]) >=
                      0 ||
                    valCompany.join("").search(parseObj.searchYearValue[3]) >= 0
                  ) {
                    valCompany = dataDescr[descriptionCounter - 4];
                    dataRow[keys[0]] = valCompany[0];
                    valCompanyAux = valCompany[0];
                    experienceInsideFlag = true;
                  }
                }

                list.push(dataRow);
                descriptionCounter = 0;
                experienceCityFlag = false;
                dataDescr = [];
              } else {
                dataDescr.push(page[row]);

                if (
                  page[row].join("").search(parseObj.searchMonth[0]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[1]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[2]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[3]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[4]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[5]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[6]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[7]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[8]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[9]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[10]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[11]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[12]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[13]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[14]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[15]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[16]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[17]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[18]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[19]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[20]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[21]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[22]) >= 0 ||
                  page[row].join("").search(parseObj.searchMonth[23]) >= 0
                ) {
                  experienceCityFlag = true;
                  descriptionCounter = descriptionCounter + 1;
                } else {
                  descriptionCounter = descriptionCounter + 1;
                }
              }
            }
          }
        }
      }
    }
  }

  return list;
}

module.exports = async function parse(buf, reader) {
  const data = await readPDFPages(buf, reader);
  //console.log({'beforeParse': data});
  const parsedData = parseLinkedin(data);
  //return data;
  return parsedData;
};
