import glob from 'tiny-glob';
import date from 'date-and-time';
import fs from "fs";
import { DataPointsLinesResponse, Predict3DataPoints, Read10ConsecutiveRandomDataPoints } from "./exchange";

const baseInputPath = './stock_price_data_files';
const baseOutputPath = './stock_price_prediction_files';

type CSVFiles = {
    fullFilePath: string;
    exchange: string;
    stockfile: string;
  }

export type ProcessFilesResponse = {
    status: "success"|"failed";
    error?: string;
  }


export async function ProcessFiles(nf: number): Promise<ProcessFilesResponse>
  {

    const randomOutputSubfolder = date.format(new Date(), "YYYY-MM-DD_HH-mm-ss_SSS");

    const allExchangesCSVFiles: Map<string, CSVFiles[]> = await ListDataFiles(baseInputPath);
  
  
    for (const [exchangeName, exchangeCSVFilesArray] of allExchangesCSVFiles) {
      //console.log("exchangeName: " + exchangeName + " exchange CSV Files: " + JSON.stringify(exchangeCSVFilesArray));
      let processedFiles: number = 0;
      let csvFileIndexInCurrentExchange: number = -1;
      while (processedFiles < nf && csvFileIndexInCurrentExchange + 1 < exchangeCSVFilesArray.length){
        
        //Take next unprocessed available file
        csvFileIndexInCurrentExchange++;
        const dataFile = exchangeCSVFilesArray[csvFileIndexInCurrentExchange];

        //console.log("processedFiles: " + processedFiles + " csvFileIndexInCurrentExchange: "+ csvFileIndexInCurrentExchange);
  
        const consecutives10: DataPointsLinesResponse = await Read10ConsecutiveRandomDataPoints(dataFile.fullFilePath);
        if (consecutives10.error) {
          console.log("Error: " + consecutives10.error)
          //Can not process this csv file, skip it
        }
        else{
          const predict3DataPoints: DataPointsLinesResponse = Predict3DataPoints( consecutives10.datapoint!);
          //console.log("Predict3DataPoints(10ConsecutiveRandomDataPoints): " + JSON.stringify(predict3DataPoints));
  
          if (predict3DataPoints.error) {
            console.log("Error: " + predict3DataPoints.error)
            //Can not predict 3 point for this csv file, skip it
          }
          else {
            //Save prediction in output folder
            const bWriteFileSuccess = await WriteCSVFile(baseOutputPath, randomOutputSubfolder, dataFile.exchange, dataFile.stockfile, predict3DataPoints.datapoint!);
            
            if (!bWriteFileSuccess) {
                //critical error can not write output files
                return {
                    status: 'failed',
                    error: `Can not write output files`
                }
            }

            processedFiles++;
          }
          
        }
    
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

async function ListDataFiles(basePath: string = './stock_price_data_files') : Promise<Map<string, CSVFiles[]>>{

    const exchangeFiles: Map<string, CSVFiles[]> = new Map<string, CSVFiles[]>();

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

async function WriteCSVFile(basePath: string = './stock_price_prediction_files', resultSubfolder: string, exchangeName: string, fileName: string, records: string[]): Promise<boolean>
{
    //Create base folder and exchange subfolder
    //https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
    try {
        if (!fs.existsSync(basePath)) {
          fs.mkdirSync(basePath);
        }
        if (!fs.existsSync(`${basePath}/${resultSubfolder}`)) {
          fs.mkdirSync(`${basePath}/${resultSubfolder}`);
        }
        if (!fs.existsSync(`${basePath}/${resultSubfolder}/${exchangeName}`)) {
          fs.mkdirSync(`${basePath}/${resultSubfolder}/${exchangeName}`);
        }
    } catch (err) {
        //console.error(err);
        return false;
    }

    try {
        fs.writeFileSync(`${basePath}/${resultSubfolder}/${exchangeName}/${fileName}`, records.join('\r\n')+'\r\n');
      } catch (err) {
        //console.error(err);
        return false;
      }

    return true;
}
