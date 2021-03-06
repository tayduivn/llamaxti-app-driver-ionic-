import { Component, OnInit, OnDestroy } from '@angular/core';
import { IProfile } from '../../interfaces/profile.interface';
import { Subscription } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { UiUtilitiesService } from '../../services/ui-utilities.service';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from '../../services/user.service';
import { ModalProfilePage } from '../modal-profile/modal-profile.page';
import { SocketService } from 'src/app/services/socket.service';

const URI_SERVER = environment.URL_SERVER;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  profileSbc: Subscription;
  dataProfile: IProfile = {
    yearsOld: 0,
    img: 'xD.jpg',
    aboutMe: ''
  };

  pathImg = URI_SERVER + '/User/Img/Get/';
  pathDriver = URI_SERVER + `/Driver/Img/Get/driver/`;
  loading = false;
  loadingModal = false;

  pathLicense = '';
  pathPolicialRecord = '';
  pathCriminalRecord = '';
  pathCheck = '';

  // tslint:disable-next-line: max-line-length
  constructor( public st: StorageService, private ui: UiUtilitiesService, private modalCtrl: ModalController, private userSvc: UserService, public io: SocketService ) { }

  async ngOnInit() {
    this.loading = true;
    await this.ui.onShowLoading('Espere...');

    this.st.onLoadToken().then( async () => {
      this.loading = false;

      this.onLoadProfile();

    }).catch( e => console.error('Error al cargar storage', e ) );

  }

  onLoadProfile() {
    this.profileSbc = this.userSvc.onGetProfile().pipe( retry() ).subscribe( async (res) => {
      if (!res.ok) {
        throw new Error( res.error );
      }

      await this.ui.onHideLoading();
      this.dataProfile = res.data;
      const pkDriver = this.dataProfile.pkDriver ;
      this.dataProfile.sexText = 'MASCULINO';
      this.pathLicense = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgLicense }?token=${ this.st.token }`;
      this.pathPolicialRecord = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgPolicialRecord }?token=${ this.st.token }`;
      this.pathCriminalRecord = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgCriminalRecord }?token=${ this.st.token }`;
      this.pathCheck = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgPhotoCheck }?token=${ this.st.token }`;

      // this.dataProfile.brithDate = moment
      this.dataProfile.dateLicenseExpiration = moment( this.dataProfile.dateLicenseExpiration ).format('YYYY-MM-DD');

      if (this.dataProfile.brithDate) {
          this.dataProfile.brithDate = moment( this.dataProfile.brithDate ).format('YYYY-MM-DD');
      }
      if (this.dataProfile.sex !== 'M') {
        this.dataProfile.sexText = this.dataProfile.sex === 'F' ? 'FEMENINO' : 'OTRO';
      }

    });
  }

  async onShowEditProfile() {
    this.loadingModal = true;
    const modalProf = await this.modalCtrl.create({
      animated: true,
      component: ModalProfilePage,
      componentProps: {
        bodyProfile: this.dataProfile,
        token: this.st.token
      }
    });

    modalProf.present().then( () => {
      this.loadingModal = false;
    });

    modalProf.onDidDismiss().then( (resModal) => {
      if (resModal.data.ok) {
        this.dataProfile = resModal.data.data;
        const pkDriver = this.dataProfile.pkDriver;
        this.pathLicense = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgLicense }?token=${ this.st.token }`;
        this.pathPolicialRecord = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgPolicialRecord }?token=${ this.st.token }`;
        this.pathCriminalRecord = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgCriminalRecord }?token=${ this.st.token }`;
        this.pathCheck = this.pathDriver + `${ pkDriver }/${ this.dataProfile.imgPhotoCheck }?token=${ this.st.token }`;
        const newDataUser = this.st.dataUser;
        newDataUser.name = this.dataProfile.name;
        newDataUser.surname = this.dataProfile.surname;
        newDataUser.nameComplete = this.dataProfile.nameComplete;

        if (resModal.data.okUpload) {
          this.dataProfile.img = resModal.data.newImg;
          newDataUser.img = this.dataProfile.img;
        }

        this.st.dataUser = newDataUser;
        this.st.onSetItem('dataUser', newDataUser, true);
      }
    });

  }

  ngOnDestroy() {
    this.profileSbc.unsubscribe();
  }

}
