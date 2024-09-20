import glob from 'tiny-glob';

import fs, {readFileSync} from "fs";
import readline from 'readline';

export type CSVFiles = {
    fullFilePath: string;
    exchange: string,
    stockfile: string,
  }

export async function ListDataFiles(basePath: string = './stock_price_data_files') : Promise<CSVFiles[]>{
    const paths = await glob(basePath + '/*/*');
    const datafiles = [] as CSVFiles[];

    for (const p of paths){
        const parts = p.split('\\'); //TODO: test on linux also, maybe split on / character
        console.log(parts);
        const df = {
            fullFilePath: p,
            exchange: parts[1], 
            stockfile: parts[2]
        };
        datafiles.push( df );
        const n = await Read10ConsecutiveRandomDataPoints(p);
        console.log("10ConsecutiveRandomDataPoints: " + JSON.stringify(n))

    }    
    //console.log(datafiles);
    return datafiles;
}

export type CSVRecord = {
    stockId: string,
    timestamp: string,
    stockPrice: number
}

async function CountLinesInCSVFile(csvPath: string): Promise<number> {
    try {
      //Credit to : https://medium.com/hail-trace/effortlessly-reading-files-line-by-line-in-node-js-7775f27c40cc
      let result: number = 0; 
      const fileStream = fs.createReadStream(csvPath);
  
      fileStream.on('error', (err) => {
        console.error(`Error reading file: ${err.message}`);
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
      console.error(`Error processing file: ${err.message}`);
      return 0;
    }
  }

function RandomUpTo(max: number) {
    //Credits to: https://futurestud.io/tutorials/generate-a-random-number-in-range-with-javascript-node-js
    //Generate ramdom between 1 and max  
    return Math.floor(
        Math.random() * (max - 1) + 1
    );
}

export async function Read10ConsecutiveRandomDataPoints(csvPath: string): Promise<string[]>{

    let result: string[] = [];

    const n = await CountLinesInCSVFile(csvPath);

    //check if n>=10

    const r = RandomUpTo(n-9);

    console.log("Random: " + r);


    //Skip r-1 lines from csv file and reaturn next 10
    try {
        //Credit to : https://medium.com/hail-trace/effortlessly-reading-files-line-by-line-in-node-js-7775f27c40cc
        let lineNumber: number = 0; 
        const fileStream = fs.createReadStream(csvPath);
    
        fileStream.on('error', (err) => {
          console.error(`Error reading file: ${err.message}`);
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
            result.push(line);
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
        return result;
      } catch (err: any) {
        console.error(`Error processing file: ${err.message}`);
        return result;
      }
    
  

    return result;
}

