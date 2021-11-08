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

  export_scene(callback)
  {
    return this.scene_controller.export_scene(callback);
  }

  load_floor_plan(name, path)
  {
    
  }
}
