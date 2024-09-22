import glob from 'tiny-glob';

import fs from "fs";
import readline from 'readline';

import date from 'date-and-time';


export type CSVFiles = {
    fullFilePath: string;
    exchange: string;
    stockfile: string;
  }

export type DataPointsLinesResponse = {
    datapoint?: string[],
    error?: string
  }

export type ProcessFilesResponse = {
  response?: any;
  status: "success"|"failed";
  error?: string;
}
export async function ProcessFiles(nf: number): Promise<ProcessFilesResponse>
{
  const allExchangesCSVFiles: Map<string, CSVFiles[]> = await ListDataFiles();


  for (let [exchangeName, exchangeCSVFilesArray] of allExchangesCSVFiles) {
    console.log("exchangeName: " + exchangeName + " exchange CSV Files: " + JSON.stringify(exchangeCSVFilesArray));
    let processedFiles: number = 0;
    let csvFileIndexInCurrentExchange: number = -1;
    while (processedFiles < nf && csvFileIndexInCurrentExchange + 1 < exchangeCSVFilesArray.length){
      
      //Take next unprocessed available file
      csvFileIndexInCurrentExchange++;
      const dataFile = exchangeCSVFilesArray[csvFileIndexInCurrentExchange];

      const consecutives10: DataPointsLinesResponse = await Read10ConsecutiveRandomDataPoints(dataFile.fullFilePath);
      if (consecutives10.error) {
        //console.log("Error: " + consecutives10.error)
        //Can not process this csv file, skip it
        csvFileIndexInCurrentExchange++;
      }
      else{
        const predict3DataPoints: DataPointsLinesResponse = Predict3DataPoints( consecutives10.datapoint!);
        console.log("Predict3DataPoints(10ConsecutiveRandomDataPoints): " + JSON.stringify(predict3DataPoints));

        if (predict3DataPoints.error) {
          //Can not predict 3 point for this csv file, skip it
          csvFileIndexInCurrentExchange++;
        }
        else {
          //Save prediction in output folder
          //F(consecutives10.datapoint, basepath, df) // write lines to csv file
          csvFileIndexInCurrentExchange++;
          processedFiles++;
        }
        
      }


      processedFiles++;
    }

    if (processedFiles < nf && exchangeCSVFilesArray.length >= nf){
      return {
        status: 'failed',
        error: `Can not process ${nf} files for exchange ${exchangeName} from ${exchangeCSVFilesArray.length} existing data files`
      }
    }
  }


  return {
    status: 'success'
  };
}

export async function ListDataFiles(basePath: string = './stock_price_data_files') : Promise<Map<string, CSVFiles[]>>{

    let exchangeFiles: Map<string, CSVFiles[]> = new Map<string, CSVFiles[]>();

    const paths = await glob(basePath + '/*/*');

    for (const p of paths){
        const parts = p.split('\\'); //TODO: test on linux also, maybe split on / character
        //console.log(parts);
        const df = {
            fullFilePath: p,
            exchange: parts[1], 
            stockfile: parts[2]
        };

        if (!exchangeFiles.has(df.exchange)) {exchangeFiles.set(df.exchange, [] as CSVFiles[]);}
        exchangeFiles.get(df.exchange)!.push(df);
      
    }    
    return exchangeFiles;
}

export type CSVRecord = {
    stockId: string,
    timestamp: Date,
    stockPrice: number
}

//Return -1 on error or number of lines
async function CountLinesInCSVFile(csvPath: string): Promise<number> {
    try {
      //Credit to : https://medium.com/hail-trace/effortlessly-reading-files-line-by-line-in-node-js-7775f27c40cc
      let result: number = 0; 
      const fileStream = fs.createReadStream(csvPath);
  
      fileStream.on('error', (err) => {
        //console.error(`Error reading file: ${err.message}`);
        return -1;
      });
  
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
  
      for await (const line of rl) {
        //console.log(`Line: ${line}`);
        result ++;
      }
      return result;
    } catch (err: any) {
      //console.error(`Error processing file: ${err.message}`);
      return -1;
    }
  }

function RandomUpTo(max: number) {
    //Credits to: https://futurestud.io/tutorials/generate-a-random-number-in-range-with-javascript-node-js
    //Generate ramdom between 1 and max  
    return Math.floor(
        Math.random() * (max - 1) + 1
    );
}

export async function Read10ConsecutiveRandomDataPoints(csvPath: string): Promise<DataPointsLinesResponse>{

    let result = {} as DataPointsLinesResponse;

    const n = await CountLinesInCSVFile(csvPath);

    //check if n>=10
    if (n<10) {result.error="Datapoints set " + csvPath + " is not of minimum length 10"; return result;}

    const r = RandomUpTo(n-9);

    //console.log("Random: " + r);

    let resultLines = [] as string[];

    //Skip r-1 lines from csv file and reaturn next 10
    try {
        //Credit to : https://medium.com/hail-trace/effortlessly-reading-files-line-by-line-in-node-js-7775f27c40cc
        let lineNumber: number = 0; 
        const fileStream = fs.createReadStream(csvPath);
    
        fileStream.on('error', (err) => {
          //console.error(`Error reading file: ${err.message}`);
          result.error=`Error: ${err.message} reading file: ${csvPath}`; 
          return result;
        });
    
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });
    
        for await (const line of rl) {
          //console.log(`Line: ${line}`);
          lineNumber ++;

          if (lineNumber >= r){
            //console.log("" + lineNumber + " " + line);
            resultLines.push(line);
          }
          else{
            //console.log("Skip line: " + lineNumber)
          }
          if (lineNumber == (r + 10 - 1)) //Stop after 10 records
          {
            fileStream.destroy();
            //console.log("Stream closed after line: " + lineNumber);
            break;
          }
        }
        result.datapoint = [...resultLines];
        return result;
      } catch (err: any) {
        //console.error(`Error processing file: ${err.message}`);
        result.error=`Error: ${err.message} processing file: ${csvPath}`;
        return result;
      }
}


//return 13 DataPoints from 10 DataPoints
export function Predict3DataPoints(records10: string[]): DataPointsLinesResponse{

    let result = {} as DataPointsLinesResponse;

    //check if record10 has length 10
    if(records10.length != 10) {result.error="Datapoints set is not of length 10"; return result;}
  
    //parse check if input DataPoints are valid values
    let parsedDataPoints: CSVRecord[] = [];
    for (const line of records10){
        const parts = line.split(',');
        if(parts.length != 3) {result.error="Can not parse datapoint csv line: " + line; return result;}
        let stockId = '';
        let timestamp = new Date();
        let stockPrice = -1;
        try{
            stockId = parts[0];
            if (stockId == "") {result.error="Can not parse stockId in datapoint csv line: " + line; return result;}
            const timestampString = parts[1];
            timestamp = date.parse(timestampString, 'DD-MM-YYYY');
            const dts = date.format(timestamp, 'DD-MM-YYYY');
            if ( timestampString != dts ) {result.error="Can not parse timestamp in datapoint csv line: " + line; return result;}
            const stockPriceString: string = parts[2] as string;
            const isNumeric = /^[+-]?\d+(\.\d+)?$/.test(stockPriceString);
            if ( !isNumeric ) {result.error="Can not parse numeric stock price in datapoint csv line: " + line; return result;}
            stockPrice = parseFloat(stockPriceString);
            if ( stockPrice <= 0 ) {result.error="Can not parse stock price in datapoint csv line: " + line; return result;}
        }
        catch(e){
            {result.error="Can not parse values in datapoint csv line: " + line; return result;}
        }
        const newCSVRecord = {
            stockId: stockId,
            timestamp: timestamp,
            stockPrice: stockPrice
        } as CSVRecord;

        parsedDataPoints.push(newCSVRecord);
    }

    result.datapoint = [...records10]; //keep first 10 records

    //Prediction logic for next 3 records
    
    //n+1 datapoint prediction
    let highest = parsedDataPoints[0].stockPrice;
    let secondHighest = -Infinity;
    for (let i = 1; i < parsedDataPoints.length; i++) {
      if (parsedDataPoints[i].stockPrice > highest) {
        secondHighest = highest;
        highest = parsedDataPoints[i].stockPrice;
      } else if (parsedDataPoints[i].stockPrice < highest && parsedDataPoints[i].stockPrice > secondHighest) {
        secondHighest = parsedDataPoints[i].stockPrice;
      }
    }

    const n1_stockId = parsedDataPoints[9].stockId;
    const n1_timestamp = date.format(date.addDays(parsedDataPoints[9].timestamp, 1), 'DD-MM-YYYY');
    const n1_stockPrice = secondHighest;

    const n1_line = `${n1_stockId},${n1_timestamp},${n1_stockPrice}`;
    result.datapoint.push(n1_line);

    //n+2 datapoint prediction
    const n2_stockId = parsedDataPoints[9].stockId;
    const n2_timestamp = date.format(date.addDays(parsedDataPoints[9].timestamp, 2), 'DD-MM-YYYY');
    const n2_stockPrice = Math.round(( n1_stockPrice + (n1_stockPrice - parsedDataPoints[9].stockPrice) / 2 + Number.EPSILON) * 100) / 100;
    const n2_line = `${n2_stockId},${n2_timestamp},${n2_stockPrice}`;
    result.datapoint.push(n2_line);

    //n+3 datapoint prediction
    const n3_stockId = parsedDataPoints[9].stockId;
    const n3_timestamp = date.format(date.addDays(parsedDataPoints[9].timestamp, 3), 'DD-MM-YYYY');
    const n3_stockPrice = Math.round(( n2_stockPrice + (n2_stockPrice - n1_stockPrice) / 4 + Number.EPSILON) * 100) / 100;
    const n3_line = `${n3_stockId},${n3_timestamp},${n3_stockPrice}`;
    result.datapoint.push(n3_line);

    return result;
}