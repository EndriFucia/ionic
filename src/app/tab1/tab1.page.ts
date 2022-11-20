import { Component } from '@angular/core';
import { Settings } from '../models';
import { FileOperationService } from '../services/file-operation.service';
import { ActivatedRoute } from '@angular/router';
import { Song } from '../models';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  songs: Array<Song> = [];
  videoPlayer: HTMLVideoElement;
  inputFile: HTMLInputElement;
  settings: Settings = {
    progressBarColor: 'gray',
    progressIndicatorColor: 'red'
  }

  fullImagePath: string = '';
  imageBasePath: string = '../../assets/images/';

  interval: any;
  videoDuration: string = '00:00:00';
  videoPaused: boolean = false;

  progressBarPosition: number = 0;
  progressIndicatorPosition: number = 0;
  minPosition: number = 0
  maxPosition: number = window.innerWidth - (window.innerWidth * 5 / 100);
  debugInfo: string = '';

  constructor(private fileService: FileOperationService, private route: ActivatedRoute) {
    this.fullImagePath = '../../assets/images/play.png';
    this.route.paramMap.subscribe(() => {
      if(this.settings.progressBarColor === this.fileService.settings.progressBarColor && this.fileService.settings.progressIndicatorColor === this.settings.progressIndicatorColor) {
        this.fileService.readSettings().then((setting) => {
        this.settings = setting;
      });
      } else {
        this.settings = this.fileService.settings;
      }
    });
  }

  onFileSelect(event: any) {
    this.inputFile = document.getElementById('videoFile') as HTMLInputElement;
    this.videoPlayer = document.querySelector('video');
    this.videoPlayer.src = URL.createObjectURL(<File>event.target.files[0]);
    this.videoPlayer.play().then(() => {
      this.videoDuration = this.calculateDuration(this.videoPlayer.duration);
      this.fullImagePath = this.imageBasePath + 'pause.png';
      this.startInterval(); 
      let song: Song = {title: this.inputFile.files[0].name.split('.')[0], type: this.inputFile.files[0].type, url: this.videoPlayer.src};
      if(!this.checkIfSongExists(song)) {
        this.songs.push(song); 
      }
    });
  }

  stop() {
    try {
      if (this.videoPlayer.isConnected) {
        this.videoPlayer.pause();
        this.videoPlayer.src = '';
        this.inputFile.value = null;
        this.fullImagePath = this.imageBasePath + 'play.png';
        this.videoDuration = '00:00:00';
        this.stopInterval();
        this.progressIndicatorPosition = this.minPosition;
        this.progressBarPosition = 0;
      }
    }
    catch {
      console.log("Player is already stopped!");
    }
  }

  play() {
    try {
      if (this.videoPlayer.src != null) {
        this.videoPlayer.play();
        this.startInterval();
      }
    }
    catch {
      console.log("Player has no media to play!");
    }
  }

  pause() {
    try {
      if (this.videoPlayer.isConnected) {
        this.videoPlayer.pause();
        this.videoPaused = true;
        this.stopInterval();
      }
    }
    catch {
      console.log("Player is not connected!");
    }
  }

  processPlayerState() {
    try {
      if (!this.videoPlayer.paused) {
        this.pause();
        this.fullImagePath = this.imageBasePath + 'play.png';
      }
      else {
        this.play();
        this.fullImagePath = this.imageBasePath + 'pause.png';
      }
    } catch {
      console.log("Please select media!");
    }
    
  }

  calculateDuration(duration: number): string {
    let timeString = '';
    let hours =  ~~(duration / 3600), minutes = 0, seconds = 0;
    
    duration -= hours * 3600;
    minutes = ~~(duration / 60);
    duration -= minutes * 60;

    if (duration < 0) {
      seconds = 0;
    }
    seconds = ~~duration;

    if (hours < 10) {
      timeString += '0' + parseInt(String(hours)) + ':'; 
    }
    else if (hours >= 10) {
      timeString += parseInt(String(hours)) + ':'; 
    }
    else {
      timeString += '00:';
    }

    if (minutes < 10) {
      timeString += '0' + String(minutes) + ':'; 
    }
    else {
      timeString += String(minutes) + ':'; 
    }

    if (seconds < 10) {
      timeString += '0' + String(seconds); 
    }
    else {
      timeString += String(seconds); 
    }

    return timeString;
  }

  startInterval() {
    this.interval = setInterval(() => {
      this.calculateProgress(document.getElementById('progressBarContainer').offsetWidth);

      if (this.videoPlayer.currentTime == this.videoPlayer.duration) {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  stopInterval() {
    clearInterval(this.interval);
  }

  calculateProgress(width: number) {
    if (this.videoPlayer && this.videoPlayer.duration != NaN) {
      let progressInPercent = (this.videoPlayer.currentTime / this.videoPlayer.duration) * 100;
      if (this.progressIndicatorPosition + this.minPosition >= this.maxPosition) {
        this.progressIndicatorPosition = this.maxPosition;
      } else {
        this.progressIndicatorPosition = (width * progressInPercent / 100);
      }

      if (this.progressBarPosition + this.minPosition >= this.maxPosition) {
        this.progressBarPosition = this.maxPosition - this.minPosition;
      } else {
        this.progressBarPosition = (width * progressInPercent / 100);
      }
    }
    else {
      this.progressIndicatorPosition = 0;
      this.progressBarPosition = 0;
    }
  }

  changePosition(event: any) {
    let position = Number(event.clientX);
    if(this.videoPlayer.isConnected) {
      if (position >= this.minPosition && position <= this.maxPosition) {
        this.progressIndicatorPosition = position;
        this.progressBarPosition = position;
        let currentPositionPercentage = position / document.getElementById('progressBarContainer').offsetWidth * 100;
        this.videoPlayer.currentTime = currentPositionPercentage * this.videoPlayer.duration / 100;
      }
    }
  }

  checkIfSongExists(song: Song): boolean {
    let res = false;
    this.songs.forEach((songItem: Song) => {
      if(song.title == songItem.title && song.type == songItem.type) {
        res = true;
      }
    });

    return res;
  }

  deleteSongFromList(index: number) {
    this.songs.splice(index, 1);
  }

  playSong(index: number) {
    console.log("Double click detected!");
    if(this.videoPlayer.isConnected) {
      this.stop();
      this.videoPlayer.src = this.songs[index].url;
      this.play();
    }
  }
}