import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GoogleDriveApiService } from 'src/app/shared/google-drive-api.service';
import { FileMetaInfo } from 'src/types/file';
import { PasswordService } from '../password.service';

@Component({
  selector: 'app-select-file-dialog',
  templateUrl: './select-file-dialog.component.html',
  styleUrls: ['./select-file-dialog.component.scss'],
})
export class SelectFileDialogComponent implements OnInit {
  files: FileMetaInfo[];
  form: FormGroup;
  isProc = false;

  constructor(
    public dialogRef: MatDialogRef<SelectFileDialogComponent>,
    private service: PasswordService,
    private drive: GoogleDriveApiService,
    private ngZone: NgZone
  ) {}

  get isNewFile() {
    return this.form;
  }

  isFolder(file: FileMetaInfo) {
    return this.drive.isFolder(file);
  }

  async ngOnInit() {
    this.files = await this.drive.getFiles();
  }

  onSelectFile(file: FileMetaInfo) {
    this.isProc = true;
    this.ngZone.run(async () => {
      await this.service.selectFile(file);
      this.dialogRef.close();

      this.isProc = false;
    });
  }

  async onClickNewFile() {
    this.form = new FormGroup({
      fileName: new FormControl(null, [Validators.required]),
    });
  }

  onClickCreateFile() {
    if (this.form.invalid) {
      alert('input error');
      return;
    }

    this.isProc = true;

    this.ngZone.run(async () => {
      const fileName = this.form.get('fileName').value;
      const result = await this.service.createFile(fileName);
      if (result) {
        this.dialogRef.close(result);
      } else {
        alert('create file failure.');
      }
      this.isProc = false;
    });
  }
}