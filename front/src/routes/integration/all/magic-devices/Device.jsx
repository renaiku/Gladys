import { Text } from 'preact-i18n';
import { Component } from 'preact';
import reactCSS from 'reactcss';
import style from './style.css';
import { GithubPicker, SketchPicker, BlockPicker, TwitterPicker, CirclePicker } from 'react-color';
import { Link } from 'preact-router/match';
import cx from 'classnames';
import get from 'get-value';
import { DEVICE_FEATURE_TYPES } from '../../../../../../server/utils/constants';
import { RequestStatus, DeviceFeatureCategoriesIcon } from '../../../../utils/consts';
import convert from 'color-convert';


class Device extends Component {

  state = {
    displayColorPicker: false,
  };

  // TODO - make this a constant for the whole app
  colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "lightblue",
    "blue",
    "deepblue",
    "purple"
  ];

  tablerColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "azure",
    "indigo",
    "purple"
  ];

  refreshDeviceProperty = () => {
    console.log("refreshDeviceProperty")
    if (!this.props.device.features) {
      return null;
    }

    const colorDeviceFeature = this.props.device.features.find(
      deviceFeature => deviceFeature.type === DEVICE_FEATURE_TYPES.LIGHT.COLOR
    );

    const temperatureDeviceFeature = this.props.device.features.find(
      deviceFeature => deviceFeature.type === DEVICE_FEATURE_TYPES.LIGHT.TEMPERATURE
    );

    const brightnessDeviceFeature = this.props.device.features.find(
      deviceFeature => deviceFeature.type === DEVICE_FEATURE_TYPES.LIGHT.BRIGHTNESS
    );

    const colorHSL = JSON.parse(get(colorDeviceFeature, 'last_value_string'));
    const colorKeyword = convert.hsl.keyword([colorHSL.h, colorHSL.s, colorHSL.l]);
    const temperature = get(temperatureDeviceFeature, 'last_value_string')
    const brightness = JSON.parse(get(brightnessDeviceFeature, 'last_value'));
    
    console.log("setting colorHSL to " + JSON.stringify(colorHSL));
    console.log("setting colorKeyword to " + JSON.stringify(colorKeyword));
    console.log("setting temperature to " + JSON.stringify(temperature));
    console.log("setting brightness to " + JSON.stringify(brightness));

    this.setState({
      colorHSL,
      colorKeyword,
      temperature,
      brightness
    });
  };

  saveDevice = async () => {
    this.setState({ loading: true });
    try {
      await this.props.saveDevice(this.props.device);
    } catch (e) {
      this.setState({ error: RequestStatus.Error });
    }
    this.setState({ loading: false });
  };

  deleteDevice = async () => {
    this.setState({ loading: true });
    try {
      await this.props.deleteDevice(this.props.device, this.props.deviceIndex);
    } catch (e) {
      this.setState({ error: RequestStatus.Error });
    }
    this.setState({ loading: false });
  };

  updateName = e => {
    this.props.updateDeviceProperty(this.props.deviceIndex, 'name', e.target.value);
  };

  updateRoom = e => {
    this.props.updateDeviceProperty(this.props.deviceIndex, 'room_id', e.target.value);
  };

  componentWillMount() {
    console.log("from componentWillMount:");
    this.refreshDeviceProperty();
  }

  componentWillUpdate() {
    console.log("from componentWillUpdate:");
    //this.refreshDeviceProperty();
  }

  

  handleChangeColor = (event) => {

    const keyword = event.target.value;
    console.log("clicked on color:", event.target.value);

    let feature;
    let value;

    if (keyword === "warm" || keyword === "cold") {

      this.setState({
        temperature: keyword,
        mode: "temperature"
      });
      
      feature = this.props.device.features.find(
        deviceFeature => deviceFeature.type === DEVICE_FEATURE_TYPES.LIGHT.TEMPERATURE
      );

      value = keyword;
      
    } else {

      this.setState({
        color: keyword,
        mode: "color"
      });

      feature = this.props.device.features.find(
        deviceFeature => deviceFeature.type === DEVICE_FEATURE_TYPES.LIGHT.COLOR
      );

      const colorHSL = convert.keyword.hsl(keyword);
      value = `{ "h": ${colorHSL.h}, "s": ${colorHSL.s*100}, "l": ${colorHSL.l*100} }`;

    }

    this.props.setValue(feature, value);

    // const color = {
    //   h: colorObject.hsl.h,
    //   s: colorObject.hsl.s,
    //   l: colorObject.hsl.l
    // }

    // this.setState({
    //   color
    // });

    // this.props.setValue(colorDeviceFeature, color);
    //this.refreshDeviceProperty();
  };

  

  render(props, { loading }) {

    const tablerColorButtons = [];
    const tablerTemperatureButtons = [];

    // essayer de changer checkbox par radio btn ?
    // https://preview.tabler.io/docs/form-components.html
    // et icon btn
    // https://preview.tabler.io/docs/buttons.html
    // fusionner ?
    tablerTemperatureButtons.push(
      <div class="col-auto">
        <label class="colorinput">
          <input name="color" type="radio" value="warm" class="colorinput-input" onChange={this.handleChangeColor} />
          <span className="colorinput-color bg-yellow-light" />
        </label>
      </div>
    );

    tablerTemperatureButtons.push(
      <div class="col-auto">
        <label class="colorinput">
          <input name="color" type="radio" value="cold" class="colorinput-input" onChange={this.handleChangeColor} />
          <span className="colorinput-color bg-blue-light" />
        </label>
      </div>
    );

    // the defaults colors
    for (const color of this.tablerColors) {
      const classes = `colorinput-color bg-${color}`;
      tablerColorButtons.push(
        <div class="col-auto">
          <label class="colorinput">
            <input name="color" type="radio" value={color} class="colorinput-input" onChange={this.handleChangeColor} />
            <span className={classes} />
          </label>
        </div>
      );
    }

    return (
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{props.device.name}</h3>
          </div>
          <div
            class={cx('dimmer', {
              active: loading
            })}
          >
            <div class="loader" />
            <div class="dimmer-content">
              <div class="card-body">

                <div class="form-group">
                  <label>
                    <Text id="integration.common.labels.name" />
                  </label>
                  <input
                    type="text"
                    value={props.device.name}
                    onInput={this.updateName}
                    class="form-control"
                    placeholder={props.device.model}
                  />
                </div>

                <div class="form-group">
                  <label>
                    <Text id="integration.common.labels.temperature" />
                  </label>
                  <div class="row gutters-xs">
                    {tablerTemperatureButtons}
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <Text id="integration.common.labels.color" />
                  </label>
                  <div class="row gutters-xs">
                    {tablerColorButtons}
                  </div>
                </div>

                <div class="form-group">
                  <label>
                    <Text id="integration.common.labels.brightness" /> - {this.state.brightness}
                  </label>
                  <input type="range" min="0" max="255" value={this.state.brightness} class="form-control slider" />
                </div>

                <div class="form-group">
                  <label>
                    <Text id="integration.common.labels.model" />
                  </label>
                  <input type="text" value={props.device.model} class="form-control" disabled />
                </div>                

                <div class="form-group">
                  <label>
                    <Text id="integration.magicDevices.device.macLabel" />
                  </label>
                  <input type="text" value={props.device.external_id.split(':')[1]} class="form-control" disabled />
                </div>

                <div class="form-group">
                  <label>
                    <Text id="integration.magicDevices.device.ipLabel" />
                  </label>
                  <input type="text" value={props.device.params.find(param => param.name === 'IP_ADDRESS').value} class="form-control" disabled />
                </div>

                <div class="form-group">
                  <label>
                    <Text id="integration.common.labels.room" />
                  </label>
                  <select onChange={this.updateRoom} class="form-control">
                    <option value="">-------</option>
                    {props.houses &&
                      props.houses.map(house => (
                        <optgroup label={house.name}>
                          {house.rooms.map(room => (
                            <option selected={room.id === props.device.room_id} value={room.id}>
                              {room.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </div>
                <div class="form-group">
                  <label>
                    <Text id="integration.common.labels.features" />
                  </label>
                  <div class="tags">
                    {props.device &&
                      props.device.features &&
                      props.device.features.map(feature => (
                        <span class="tag">
                          <Text id={`deviceFeatureCategory.${feature.category}.${feature.type}`} />
                          <div class="tag-addon">
                            <i
                              class={`fe fe-${get(DeviceFeatureCategoriesIcon, `${feature.category}.${feature.type}`)}`}
                            />
                          </div>
                        </span>
                      ))}
                    {(!props.device.features || props.device.features.length === 0) && (
                      <Text id="integration.magicDevices.device.noFeatures" />
                    )}
                  </div>
                </div>
                <div class="form-group">
                  <button onClick={this.saveDevice} class="btn btn-success mr-2">
                    <Text id="integration.common.buttons.save" />
                  </button>
                  <button onClick={this.deleteDevice} class="btn btn-danger">
                    <Text id="integration.common.buttons.delete" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Device;
