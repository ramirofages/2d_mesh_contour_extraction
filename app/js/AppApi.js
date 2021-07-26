import { Graphics, ResourceBatch } from 'ohzi-core';
import { RenderLoop } from 'ohzi-core';
import { Configuration } from 'ohzi-core';
import { EventManager } from 'ohzi-core';
import { Debug } from 'ohzi-core';
import { Initializer } from 'ohzi-core';
import { ResourceContainer } from 'ohzi-core';
import Loader from './Loader';

import package_json from '../package.json';

// APP
import MainApplication from './MainApplication';

class AppApi
{
  init()
  {
    this.application = new MainApplication();
    this.loader = new Loader(this);

    this.render_loop = new RenderLoop(this.loader, Graphics);
    this.config = Configuration;

    let app_container = document.querySelector('.container');
    let canvas = document.querySelector('.main-canvas');

    Initializer.init(canvas, app_container, { antialias: true, force_webgl2: true });
    // Configuration.dpr = 1;
    Configuration.dpr = window.devicePixelRatio;

    this.application.init(Graphics);
  }

  load(settings)
  {
    this.init();

    window.app = this.application;
    window.ViewApi = this;
    window.settings = settings;
    window.author = 'OHZI INTERACTIVE';
    window.version = package_json.version;

    this.loader.load();
  }

  dispose()
  {
    this.application.dispose();
    Initializer.dispose(this.render_loop);
  }

  draw_debug_axis()
  {
    Debug.draw_axis();
  }

  register_event(name, callback)
  {
    EventManager.on(name, callback);
  }

  set_resource(name, resource)
  {
    ResourceContainer.set_resource(name, resource);
  }

  set_settings(settings)
  {
    window.settings = settings;
  }

  start_main_app()
  {
    this.render_loop.set_state(this.application);
  }

  start()
  {
    this.render_loop.start();
  }

  stop()
  {
    this.render_loop.stop();
  }

  take_screenshot(callback)
  {
    Graphics.take_screenshot(callback);
  }

  download_blob(blob)
  {
    Graphics.download_screenshot(blob);
  }
}

const Api = new AppApi();
export { Api, ResourceBatch };
