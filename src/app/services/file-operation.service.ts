import { Injectable } from '@angular/core';
import { Directory, Encoding, Filesystem, WriteFileResult } from '@capacitor/filesystem';
import { Settings } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FileOperationService {

  file: string = 'settings.txt';
  writeResult: WriteFileResult;
  settings: Settings = {
    progressBarColor: 'gray',
    progressIndicatorColor: 'red'
  }

  constructor() { }

  async writeSettings(settings: Settings): Promise<Boolean> {
    this.writeResult = await Filesystem.writeFile({
      path: this.file,
      data: JSON.stringify(settings),
      directory: Directory.Data,
      encoding: Encoding.UTF8  
    });

    if(!this.writeResult.uri) {
      return false;
    }

    this.settings = settings;
    return true;
  }

  async readSettings(): Promise<Settings> {
    const set = await Filesystem.readFile({path: this.file, directory: Directory.Data, encoding: Encoding.UTF8});
    if(set.data) {
      return JSON.parse(set.data);
    }
    return this.settings;
  }
}
