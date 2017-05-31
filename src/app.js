import React from 'react';
import Sound from 'react-native-sound';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

const music = new Sound('music.mp3', Sound.MAIN_BUNDLE, (error) => console.log(error));

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSong: {
        url: "http://localhost:8000/test.mp3",
      },
    };
  }
  render() {
    return (
      <Stage />
    );
  }
}

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: 0,
      miss: 0,
    };
  }
  handlePress() {
    let now = Date.now() / 1000 - this.props.startTime;
    for (let i = 0; i < timings.length; i++) {
      let timing = timings[i];
      console.log(Math.abs(timing - now));
      if (Math.abs(timing - now) < 0.2) {
        this.setState({ success: this.state.success + 1 });
        return
      }
    }
    this.setState({ miss: this.state.miss + 1 });
  }
  play() {
    music.play((success) => console.log("success: " + success));
  }
  render() {
    return (
      <View >
        <Text>Miss: {this.state.miss}</Text>
        <Text> Success: {this.state.success}</Text>
        <Button onPress={this.handlePress.bind(this)} title="aa" />
        <Button onPress={this.play.bind(this)} title="start" />
      </View>
    );
  }
}

let requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

let bpm = 165;
let spb = 60 / bpm;
let offsetTime = spb * 16;

let remps = 1000;
let chars = "ほしがふるようで".split("");
let keyCodes = [86, 79, 188, 75, 67, 70, 65, 69];
let timings =
  [spb, spb * 1.5, spb * 2, spb * 3, spb * 3.5, spb * 4.5, spb * 5.5, spb * 6.5]
    .map((orig) => orig + offsetTime);

class Stage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      startTime: Date.now() / 1000,
    };
  }
  render() {
    let mainLoop = (m) => {
      let time = m / 1000;
      if ((time - this.state.time) > 1 / 60) {
        this.setState({ time });
      }
      requestAnimationFrame(mainLoop);
    };
    requestAnimationFrame(mainLoop);

    return (
      <View>
        <Chars time={this.state.time} />
        <Counter startTime={this.state.startTime} />
      </View>
    );
  }
}

class Chars extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let positions = timings.map((timing) => (timing - this.props.time) * remps);
    const charElms = chars.map((char, i) => (
      <View style={{ position: "absolute", left: positions[i] }} key={i}>
        <Char value={char} />
      </View>
    ));
    return (
      <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflow: "hidden" }}>
        {charElms}
      </View>
    );
  }
}

class Char extends React.Component {
  render() {
    return (
      <Text style={{ fontSize: 3 }}>{this.props.value}</Text>
    );
  }
}
