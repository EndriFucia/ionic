import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../models';
import { FileOperationService } from '../services/file-operation.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {
  settings: Settings = {
    progressBarColor: '',
    progressIndicatorColor: ''
  }

  file: File;
  writeResult: string = '';

  constructor(private fileService: FileOperationService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe(() => {
      this.writeResult = '';
      this.fileService.readSettings().then((set) => {
        this.settings = set;
      });
    });
  }

  async saveSettings() {
    if(await this.fileService.writeSettings(this.settings) && this.settings.progressBarColor != null && this.settings.progressIndicatorColor != null) {
      this.writeResult = "Settings saved successfully!";
    } 
    else {
      this.writeResult = "Failed to save settings!";
    }
  } 
}
