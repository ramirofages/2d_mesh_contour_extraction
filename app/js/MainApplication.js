import { BaseApplication } from 'ohzi-core';
import { NormalRender } from 'ohzi-core';
import { Graphics } from 'ohzi-core';
import { SceneManager } from 'ohzi-core';
import { ResourceContainer } from 'ohzi-core';
import { ViewManager } from 'ohzi-core';
import { Screen } from 'ohzi-core';
import { Configuration } from 'ohzi-core';

import DatGui from './components/DatGui';
import SceneController from './components/SceneController';

import * as GLTFExporter from 'three/examples/jsm/exporters/GLTFExporter.js';

export default class MainApplication extends BaseApplication
{
  init()
  {
    this.scene_controller = SceneController;
    this.normal_render_mode = new NormalRender();

    this.scene_controller.init();

    Graphics.set_state(new NormalRender());

    DatGui.init();

    document.addEventListener('contextmenu', (event) =>
    {
      event.preventDefault();
    }, false);
  }

  on_enter()
  {
    this.config = ResourceContainer.get_resource('config');
    this.scene_controller.start();
    DatGui.start();
  }

  update()
  {
    this.scene_controller.update();
  }

  export_scene()
  {
    // Instantiate a exporter
    const exporter = new GLTFExporter();

    // Parse the input and generate the glTF output
    exporter.parse(SceneManager.current, function ( gltf ) {
      console.log( gltf );
      downloadJSON( gltf );
    }, options );
  }
}
