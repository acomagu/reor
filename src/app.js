import React from 'react';
import Sound from 'react-native-sound';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  PanResponder,
  Animated,
} from 'react-native';


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
  render() {
    return (
      <View>
        <Text>Miss: {this.props.miss}</Text>
        <Text>Success: {this.props.success}</Text>
      </View>
    );
  }
}

let bpm = 165;
let spb = 60 / bpm;
let offsetTime = spb * 1;

let remps = 1000;
let keyCodes = [86, 79, 188, 75, 67, 70, 65, 69];
let timings =
  [spb, spb * 1.5, spb * 2, spb * 3, spb * 3.5, spb * 4.5, spb * 5.5, spb * 6.5]
    .map((orig) => orig + offsetTime);

const timings1 = [timings[1], timings[2]];
const timings2 = [timings[0], timings[3]];
const timings3 = [timings[3], timings[4], timings[6]];
const timings4 = [timings[5], timings[6], timings[7]];

class Stage extends React.Component {
  constructor(props) {
    super(props);
    this.music = new Sound('music.mp3', Sound.MAIN_BUNDLE, (error) => {
      if(error) {
        console.log(error);
      } else {
        this.musicLoop(0);
        this.setState({
          duration: this.music.getDuration(),
          success: 0,
          miss: 0,
        });
        this.music.play((success) => {
          console.log("success: " + success)
        });
      }
    });
    this.state = {
      time: 0,
      elapsed: new Animated.Value(0),
      duration: 1,
    };
    this.musicAnimatedEvent = Animated.event(
      [this.state.elapsed]
    );
  }
  musicLoop(seconds) {
    if(seconds != 0) {
      this.musicAnimatedEvent(seconds);
    }
    this.music.getCurrentTime(this.musicLoop.bind(this));
  }
  onSuccess() {
    this.setState({
      success: this.state.success + 1,
    });
  }
  onMiss() {
    this.setState({
      miss: this.state.miss + 1,
    });
  }
  render() {
    const backgroundColor = "#eee";
    return (
      <View style={{ flex: 1 }} >
        <Counter success={this.state.success} miss={this.state.miss} />
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ flex: 1, alignItems: "center", backgroundColor }}>
              <Rane time={this.state.elapsed} duration={this.state.duration} timings={timings1} onSuccess={this.onSuccess.bind(this)} onMiss={this.onMiss.bind(this)}/>
            </View>
            <View style={{ flex: 1, alignItems: "center", backgroundColor }}>
              <Rane time={this.state.elapsed} duration={this.state.duration} timings={timings2} onSuccess={this.onSuccess.bind(this)} onMiss={this.onMiss.bind(this)}/>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ flex: 1, alignItems: "center", backgroundColor }}>
              <Rane time={this.state.elapsed} duration={this.state.duration} inverse={true} timings={timings3} onSuccess={this.onSuccess.bind(this)} onMiss={this.onMiss.bind(this)}/>
            </View>
            <View style={{ flex: 1, alignItems: "center", backgroundColor }}>
              <Rane time={this.state.elapsed} duration={this.state.duration} inverse={true} timings={timings4} onSuccess={this.onSuccess.bind(this)} onMiss={this.onMiss.bind(this)}/>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

class Rane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startTime: Date.now() / 1000,
      success: 0,
      miss: 0,
    };
  }
  onSuccess() {
    this.props.onSuccess();
  }
  onMiss() {
    this.props.onMiss();
  }
  render() {
    const timings = this.props.timings;
    const duration = this.props.duration;
    const inverse = this.props.inverse || false;
    const speed = 1000;
    const direction = (inverse ? -1 : 1);
    const notes = timings.map((timing, i) => {
      const pos = this.props.time.interpolate({
        inputRange: [0, duration],
        outputRange: [timing * speed * direction, (duration - timing) * (-speed) * direction],
      });
      return (
        <View key={i}>
          <Note position={pos} onSuccess={this.onSuccess.bind(this)} onMiss={this.onMiss.bind(this)} />
        </View>
      );
    });
    return (
      <View style={{ justifyContent: (inverse ? "flex-start" : "flex-end"), flex: 1 }}>
        {inverse ? null : <View style={{borderBottomWidth: 1, borderBottomColor: "gray", width: 100}}></View> }
        {inverse ? <View style={{borderBottomWidth: 1, borderBottomColor: "gray", width: 100}}></View> : null}
        {notes}
      </View>
    );
  }
}

class Note extends React.Component {
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: this.handleTap.bind(this),
    });
  }
  handleTap(evt, gestureState) {
    console.log(evt);
    let now = Date.now() / 1000 - this.props.startTime; // TODO: get time from evt
    // for (let i = 0; i < this.props.timings.length; i++) {
    //   let timing = this.props.timings[i];
    //   if (Math.abs(timing - now) < 0.2) {
    //     this.setState({ success: this.state.success + 1 });
    //     return
    //   }
    // }
    // this.setState({ miss: this.state.miss + 1 });
    if(this.props.position._value < 100) {
      this.props.onSuccess();
    } else {
      this.props.onMiss();
    }
  }
  render() {
    return (
      <Animated.View
        style={{
            height: 30,
            width: 30,
            borderRadius: 15,
            backgroundColor: "#aaa",
            position: "absolute",
            bottom: this.props.position,
            elevation: 10,
        }}
        {...this._panResponder.panHandlers}
      ></Animated.View>
    );
  }
}
