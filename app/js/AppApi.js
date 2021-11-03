import { Graphics, ResourceBatch } from 'ohzi-core';
import { RenderLoop } from 'ohzi-core';
import { Configuration } from 'ohzi-core';
import { EventManager } from 'ohzi-core';
import { Debug } from 'ohzi-core';
import { Initializer } from 'ohzi-core';
import { ResourceContainer } from 'ohzi-core';
import Loader from './Loader';

import package_json from '../../package.json';
// APP
import MainApplication from './MainApplication';

class ApplicationAPI
{
  init(settings)
  {
    this.application = new MainApplication();
    this.loader = new Loader(this);

    this.render_loop = new RenderLoop(this.loader, Graphics);

    let app_container = document.querySelector('.container');
    let canvas = document.querySelector('.main-canvas');

    Initializer.init(canvas, app_container, { antialias: true, force_webgl2: true });
    Configuration.dpr = window.devicePixelRatio;

    this.application.init();

    window.app = this.application;
    window.ViewApi = this;
    window.settings = settings;
    window.author = 'OHZI INTERACTIVE';
    window.version = package_json.version;

    this.loader.load();
    this.start();
  }

  dispose()
  {
    this.application.dispose();
    Initializer.dispose(this.render_loop);
  }

  start()
  {
    this.render_loop.start();
  }

  stop()
  {
    this.render_loop.stop();
  }

  export_scene()
  {
    this.application.export_scene();
  }
}

const api = new ApplicationAPI();
export { api };
