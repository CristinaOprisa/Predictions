import glob from 'tiny-glob';

export type CSVFiles = {
    fullFilePath: string;
    exchange: String,
    stockfile: string
  }

export async function ListDataFiles(basePath: string = './stock_price_data_files') : Promise<CSVFiles[]>{
    const paths = await glob(basePath + '/*/*');

    const datafiles = [] as CSVFiles[];

    for (const p of paths){
        const parts = p.split('\\'); //TODO: test on linux also, maybe split on / character
        console.log(parts);
        datafiles.push(
            {
                fullFilePath: p,
                exchange: parts[1], 
                stockfile: parts[2]
            });
    }    
    //console.log(datafiles);
    return datafiles;
}

export type CSVRecord = {
    stockId: string,
    timestamp: string,
    stockPrice: number
}

export async function Read10ConsecutiveDataPoints(csvPath: string): Promise<CSVRecord[]>{
    return [];
}

