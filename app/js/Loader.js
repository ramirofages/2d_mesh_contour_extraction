import { BaseApplication } from 'ohzi-core';
import { ResourceContainer } from 'ohzi-core';
import { ResourceBatch } from 'ohzi-core';
import { ViewManager } from 'ohzi-core';
import { MathUtilities } from 'ohzi-core';

import GeneralLoader from './loaders/GeneralLoader';

import InitialView from './views/InitialView';
import LoaderView from './views/LoaderView';

export default class Loader extends BaseApplication
{
  constructor(api)
  {
    super();

    this.api = api;
    this.loader_view = undefined;

    this.loaders = [];
    this.current_loader = undefined;
    this.current_loader_index = 0;

    this.second_step = false;
  }

  load()
  {
    let batch = new ResourceBatch();

    batch.add_json('config', 'data/config.json', 2000);
    batch.add_json('initial_state_data', 'data/initial_state_data.json', 1919);
    batch.add_text('loader_data', 'data/loader.xml', 4250);

    batch.load(ResourceContainer);

    this.check_resource_loading(batch, this.on_config_ready.bind(this), 10);
  }

  on_enter()
  {
    this.loader_view.start();
  }

  on_config_ready()
  {
    this.initial_view = new InitialView();
    this.loader_view = new LoaderView(this.api);

    ViewManager.set_initial_state_data(ResourceContainer.get('initial_state_data'));
    ViewManager.set_view(this.initial_view.name);

    // Start render loop
    this.api.start();

    this.on_loader_ready();
  }

  on_loader_ready()
  {
    this.second_step = true;

    // let config = ResourceContainer.get_resource('config');

    ViewManager.go_to_view(this.loader_view.name, false);

    this.loaders.push(new GeneralLoader(ResourceContainer));

    this.current_loader = this.loaders[this.current_loader_index];
    this.current_loader.load();
  }

  on_assets_ready()
  {
    this.second_step = false;
    // this.loader_view.set_progress(1);
    this.loader_view.on_assets_ready();
  }

  check_resource_loading(batch, on_resources_loaded, timeout)
  {
    // console.log(batch.get_progress(), batch.get_loaded_bytes(), batch.get_total_bytes());

    if (batch.loading_finished)
    {
      if (batch.has_errors)
      {
        batch.print_errors();
      }
      else
      {
        on_resources_loaded();
      }
    }
    else
    {
      setTimeout(function()
      {
        this.check_resource_loading(batch, on_resources_loaded);
      }.bind(this), timeout);
    }
  }

  update()
  {
    if (this.second_step)
    {
      const progress = MathUtilities.linear_map(
        this.__get_progress(),
        0, 1,
        0, 0.8
      );

      this.loader_view.set_progress(progress);

      if (this.current_loader.batch.loading_finished)
      {
        if (this.current_loader.batch.has_errors)
        {
          this.current_loader.batch.print_errors();
        }
        else
        {
          this.__on_current_loader_finished();
        }
      }
    }
  }

  __on_current_loader_finished()
  {
    this.current_loader_index++;

    if (this.current_loader_index < this.loaders.length)
    {
      this.current_loader = this.loaders[this.current_loader_index];
      this.current_loader.load();
    }
    else
    {
      this.on_assets_ready();
    }
  }

  __get_progress()
  {
    let progress = 0;

    for (let i = 0; i < this.loaders.length; i++)
    {
      const loader = this.loaders[i];

      progress += loader.batch.get_progress();
    }

    return progress / this.loaders.length;
  }
}
