export default class VertoRTC {
  public options: any;
  public rtcPeerConn: RTCPeerConnection;
  public dataChannel: any;
  public validRes = [];

  constructor(options) {
    this.options = Object.assign(
      {
        useVideo: null,
        iceServers: false,
        videoParams: {},
        audioParams: {},
        callbacks: {
          onICEComplete: function () { },
          onICE: function () { },
          onOfferSDP: function () { },
        },
      },
      options
    );

  }

  call() {
    if (!this.rtcPeerConn) {
      this.startSignaling();
    }
  }

  startSignaling() {
    const configuration = {
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
      }]
    };

    if (this.options.iceServers) {
      configuration.iceServers = this.options.iceServers;
    }


    this.rtcPeerConn = new RTCPeerConnection(configuration);
    //send any ice candidates to the other peer
    this.rtcPeerConn.onicecandidate = function (evt) {
      if (evt.candidate) {
        console.log("evt.candidate", evt.candidate)
      }
    };

    this.rtcPeerConn.onnegotiationneeded = () => {
      console.log("on negotiation called");
      //To made a offer I need to informe the terms that is necessary to do the deal.
      this.rtcPeerConn.createOffer().then((offer) => {
        this.sendLocalDesc(offer);
      }).catch(this.logError);
    }

    //Once remote stream arrives, show it in the remote video element
    //This is called after setRemoteDescription
    this.rtcPeerConn.ontrack = (event) => {
      var theirMediaStream = new MediaStream(event.streams[0])
      this.options.remoteElement.srcObject = theirMediaStream;
      this.options.remoteElement.play();
    }

    //get a local stream, show it in our video tag and add it to be sent
    VertoRTC.getUserMedia(this.options, (stream) => {
      stream.getTracks().forEach(function (track) {
        this.rtcPeerConn.addTrack(track, stream);
      });
    })

  }

  //Session description protocol
  //This is used to make a offer and describe codecs, video, audio and others...
  sendLocalDesc(desc) {
    return this.rtcPeerConn.setLocalDescription(desc);
  }

  logError(error) {
    console.error(error.name + ": " + error.message);
  }

  static getUserMedia(options, onCallBack) {
    const mediaOptions: any = {
      audio: false,
      video: {
        mandatory: {
          maxWidth: 320,
          maxHeight: 180
        }
      }
    }
    return navigator.mediaDevices
      .getUserMedia(mediaOptions)
      .then((stream) => {
        console.log("options=====>", options)
        if (options.mainElement) {
          options.mainElement.srcObject = stream;
          onCallBack(stream)
        }
      })
      .catch(options.onerror || console.error);
  }


  static checkPerms(runtime, check_audio, check_video) {
    VertoRTC.getUserMedia({
      constraints: {
        audio: check_audio,
        video: check_video,
      },
    }, () => {
      return runtime(true)
    });
  }


  static getValidRes(cam, func) {
    const validRes = [];
    const resI = 0;

    this.checkRes(cam, func);
  }

  static checkRes(cam, func) {
    return
  }
}