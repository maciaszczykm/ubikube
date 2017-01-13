import React from 'react';
import Dialog from 'material-ui/Dialog';
import LinearProgress from 'material-ui/LinearProgress';

import { readFileSync, createWriteStream, existsSync, statSync, createReadStream, openSync } from 'fs'
import { normalize } from 'path'
import { exec } from 'child_process'
import { sync } from 'md5-file'
import prettyBytes from 'pretty-bytes'
import request from 'request'
import progress from 'request-progress'
import { write } from 'etcher-image-write'

export default class ProgressDialog extends React.Component {
  constructor(props) {
    // Init state.
    super(props);
    this.state = {
      open: false,
      title: '',
      progress: 0,
      progressMode: 'indeterminate',
      description: ''
    };

    // Device to flash.
    this.device = ''

    // Token.
    this.token = ''

    // Hostname.
    this.hostname = ''
  }

  show(token, hostname, device) {
    this.init(token, hostname, device)
    let image = readFileSync('image/config.json');
    image = JSON.parse(image);
    if (this.isImageDownloaded(image)) {
      this.flashImage(image);
    } else {
      this.downloadImage(image);
    }
  }

  init(token, hostname, device) {
    this.token = token;
    this.hostname = hostname;
    this.device = device.substr(0, device.indexOf(' '));

    // Init state everytime.
    this.state.open = true;
    this.state.title = '';
    this.state.description = '';
    this.setState(this.state)
  }

  isImageDownloaded(image) {
    return existsSync('image/' + image.uncompressedFilename) &&
      sync('image/' + image.uncompressedFilename) === image.uncompressedMD5
  }

  downloadImage(image) {
    this.setProgress('Downloading image...', null, 'determinate', 0)
    progress(request(image.downloadUrl))
      .on('progress', state => {
        console.log(state);
        this.setProgress(null, `${prettyBytes(state.speed | 0)} per second, ${state.time.remaining} seconds left`, null, state.percent * 100);
      }).on('error', err => {
        console.log(err);
        this.close();
      }).on('end', () => {
        this.extractImage(image);
      }).pipe(createWriteStream('image/raspbian-lite-pibakery.7z'))
  }

  extractImage (image) {
    this.setProgress('Extracting image...', null, 'indeterminate', undefined)
    let binary
    if (process.platform == 'darwin') {
      binary = '"' + normalize(process.cwd() + '/bin/7z') + '"'
    } else if (process.platform == 'win32') {
      binary = '"' + normalize(process.cwd() + '/bin/7z.exe') + '"'
    } else if (process.platform == 'linux') {
      binary = '7za'
    }
    exec(binary + ' x -o"image/" "image/' + image.compressedFilename + '"', (error, stdout, stderr) => {
      if (error !== null) {
        this.close();
        return
      }
      this.flashImage(image)
    })
  }

  flashImage(image) {
    this.setProgress('Flashing image...', null, 'determinate', 0)
    let filename = 'image/' + image.uncompressedFilename
    write({
      fd: openSync(this.device, 'rs+'),
      device: this.device,
      size: statSync(filename).size
    }, {
      stream: createReadStream(filename),
      size: statSync(filename).size
    }, {
      check: true
    }).on('progress', state => {
      console.log(state);
      this.setProgress(null, `Transferred ${prettyBytes(state.transferred)} from ${prettyBytes(state.length)}, ${state.eta} seconds left`, null, state.percentage)
    }).on('error', error => {
      console.log(error);
      this.close();
    }).on('done', success => {
      console.log(success);
      this.setProgress(null, `Data successfully transferred, checksum ${success.sourceChecksum}`, null, 100)
      this.updateImage(image);
    });
  }

  updateImage(image) {
    this.setProgress('Updating image...', null, 'indeterminate', undefined);
    this.close();
  }

  setProgress(title, description, progressMode, progress) {
    this.setState({
      title: title === null ? this.state.title : title,
      description: description === null ? this.state.description : description,
      progressMode: progressMode === null ? this.state.progressMode : progressMode,
      progress: progress === null ? this.state.progress : progress
    })
  }

  close() {
    this.setState({open: false});
  }

  render() {
    return (
      <div>
        <Dialog title={this.state.title}
                modal={true}
                open={this.state.open}>
          <LinearProgress mode={this.state.progressMode}
                          value={this.state.progress}/>
          <br/>
          <span className='uk-dialog-description'>
            {this.state.description}
          </span>
        </Dialog>
      </div>
    );
  }
}