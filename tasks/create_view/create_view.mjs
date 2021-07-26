import path from 'path';
import fs from 'fs';
import replace from 'replace-in-file';

class ViewCreator
{
  constructor()
  {
  }

  create_view(name)
  {
    let js_path = path.join('app', 'js', 'views', `${this.capitalize(name)}View.js`);
    let data_path = path.join('public', 'data', `${name}.xml`);

    let pug_folder = path.join('app', 'views', name);
    let pug_path = path.join(pug_folder, `${name}.pug`);

    let scss_folder = path.join('app', 'css', name);
    let scss_path = path.join(scss_folder, `_${name}.scss`);

    this.__copy_template_js(js_path, name);
    this.__copy_template_data(data_path, name);
    this.__copy_template_pug(pug_folder, pug_path, name);
    this.__copy_template_scss(scss_folder, scss_path, name);

    this.__update_initial_data_file(name);
    this.__update_index_pug_file(name);
    this.__update_application_scss_file(name);
    this.__update_loader_file(name);
    this.__update_sections_file(name);
    this.__update_mainapp_file(name);
  }

  __update_initial_data_file(name)
  {
    let new_data = `"loader_opacity": 0,\n    "${name}_opacity": 0,`;

    const options = {
      files: path.join('public', 'data', 'initial_state_data.json'),
      from: '"loader_opacity": 0,',
      to: new_data
    };

    try
    {
      replace.sync(options);
      console.log('\x1b[33m%s\x1b[0m', 'index.pug Modified');
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __update_application_scss_file(name)
  {
    let new_data = `__SECTIONS__\n@import '${name}/${name}';`;

    const options = {
      files: path.join('app', 'css', 'application.scss'),
      from: '__SECTIONS__',
      to: new_data
    };

    try
    {
      replace.sync(options);
      console.log('\x1b[33m%s\x1b[0m', 'application.scss Modified');
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __update_index_pug_file(name)
  {
    let new_data = `__SECTIONS__\n      include views/${name}/${name}`;

    const options = {
      files: path.join('app', 'index.pug'),
      from: '__SECTIONS__',
      to: new_data
    };

    try
    {
      replace.sync(options);
      console.log('\x1b[33m%s\x1b[0m', 'index.pug Modified');
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __update_loader_file(name)
  {
    let new_data = `__SECTIONS_DATA__\n    this.batch.add_text('${name}_data', 'data/${name}.xml', 1639);`;

    const options = {
      files: path.join('app', 'js', 'loaders', 'GeneralLoader.js'),
      from: '__SECTIONS_DATA__',
      to: new_data
    };

    try
    {
      replace.sync(options);
      console.log('\x1b[33m%s\x1b[0m', 'GeneralLoader.js Modified');
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __update_mainapp_file(name)
  {
    let new_import = `HomeView';\nimport ${this.capitalize(name)}View from './views/${this.capitalize(name)}View';`;

    const options_1 = {
      files: path.join('app', 'js', 'MainApplication.js'),
      from: 'HomeView\';',
      to: new_import
    };

    let new_section = `HomeView();\n    this.${name.toLowerCase()}_view = new ${this.capitalize(name)}View();`;

    const options_2 = {
      files: path.join('app', 'js', 'MainApplication.js'),
      from: 'HomeView();',
      to: new_section
    };

    let new_section_start = `home_view.start();\n    this.${name.toLowerCase()}_view.start();`;

    const options_3 = {
      files: path.join('app', 'js', 'MainApplication.js'),
      from: 'home_view.start();',
      to: new_section_start
    };

    try
    {
      replace.sync(options_1);
      replace.sync(options_2);
      replace.sync(options_3);
      console.log('\x1b[33m%s\x1b[0m', 'MainApplication.js Modified');
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __update_sections_file(name)
  {
    let new_section = `'initial',\n  ${name.toUpperCase()}: '${name.toLowerCase()}',`;
    let new_section_url = `'/initial',\n  ${name.toUpperCase()}: '/${name.replace(/_/g, '-')}',`;

    const options_1 = {
      files: path.join('app', 'js', 'views', 'Sections.js'),
      from: '\'initial\',',
      to: new_section
    };

    const options_2 = {
      files: path.join('app', 'js', 'views', 'Sections.js'),
      from: '\'/initial\',',
      to: new_section_url
    };

    try
    {
      replace.sync(options_1);
      replace.sync(options_2);
      console.log('\x1b[33m%s\x1b[0m', 'Sections.js Modified');
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __copy_template_js(view_path, name)
  {
    fs.copyFileSync(
      path.join('tasks', 'create_view', 'TemplateView.js'),
      view_path
    );

    this.__replace_js_words(view_path, name);
  }

  __copy_template_data(data_path, name)
  {
    fs.copyFileSync(
      path.join('tasks', 'create_view', 'template.xml'),
      data_path
    );

    this.__replace_data_words(data_path, name);
  }

  __copy_template_scss(scss_folder, scss_path, name)
  {
    fs.mkdir(scss_folder, { recursive: true }, (err) =>
    {
      if (err)
      {
        console.error(err);
      }
      else
      {
        fs.copyFileSync(
          path.join('tasks', 'create_view', '_template.scss'),
          scss_path
        );

        this.__replace_scss_words(scss_path, name);
      }
    });
  }

  __copy_template_pug(pug_folder, pug_path, name)
  {
    fs.mkdir(pug_folder, { recursive: true }, (err) =>
    {
      if (err)
      {
        console.error(err);
      }
      else
      {
        fs.copyFileSync(
          path.join('tasks', 'create_view', 'template.pug'),
          pug_path
        );

        this.__replace_pug_words(pug_path, name);
      }
    });
  }

  __replace_data_words(path, name)
  {
    const options = {
      files: path,
      from: 'template',
      to: name
    };

    try
    {
      replace.sync(options);

      console.log('\x1b[32m', `${name}.xml Created`);
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __replace_js_words(path, name)
  {
    const options_1 = {
      files: path,
      from: /Template/g,
      to: this.capitalize(name)
    };

    const options_2 = {
      files: path,
      from: /TEMPLATE/g,
      to: name.toUpperCase()
    };

    const options_3 = {
      files: path,
      from: 'template',
      to: name.replace(/_/g, '-')
    };

    const options_4 = {
      files: path,
      from: /template_opacity/g,
      to: `${name}_opacity`
    };

    try
    {
      replace.sync(options_1);
      replace.sync(options_2);
      replace.sync(options_3);
      replace.sync(options_4);

      console.log('\x1b[32m', `${this.capitalize(name)}View.js Created`);
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __replace_scss_words(path, name)
  {
    const options = {
      files: path,
      from: 'template',
      to: `${name.replace(/_/g, '-')}`
    };

    try
    {
      replace.sync(options);

      console.log('\x1b[32m', `${name}.scss Created`);
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  __replace_pug_words(path, name)
  {
    const options = {
      files: path,
      from: 'template',
      to: `${name.replace(/_/g, '-')}`
    };

    try
    {
      replace.sync(options);

      console.log('\x1b[32m', `${name}.pug Created`);
    }
    catch (error)
    {
      console.error('Error occurred:', error);
    }
  }

  capitalize(string)
  {
    let aux_string = this.capitalize_first_letter(string);
    aux_string = this.snake_to_camelcase(aux_string);

    return aux_string;
  }

  capitalize_first_letter(string)
  {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  snake_to_camelcase(string)
  {
    return string.replace(
      /([-_][a-z])/g,
      (group) => group.toUpperCase()
        .replace('-', '')
        .replace('_', '')
    );
  }
}

new ViewCreator().create_view(process.argv.slice(2)[0]);
