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
import FloorPlanManager from './components/FloorPlanManager';


export default class MainApplication extends BaseApplication
{
  init()
  {
    this.scene_controller = SceneController;
    this.normal_render_mode = new NormalRender();

    this.scene_controller.init();

    this.floor_plan_manager = new FloorPlanManager();

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
    this.floor_plan_manager.update();
  }

  export_scene(callback)
  {
    return this.scene_controller.export_scene(callback);
  }

  load_floor_plan_gltf(name, path)
  {
    let promise_resolve = undefined;
    let promise = new Promise((resolve, reject) =>{
      promise_resolve = resolve;
    });

    let scene_controller = this.scene_controller;
    this.floor_plan_manager.load_gltf(name, path, (floor_plan)=>{
      scene_controller.add_floor_plan(floor_plan);
      promise_resolve();
    });
    
    return promise;
  }

  process_and_export_floor_plan(name)
  {
    
  }
}
