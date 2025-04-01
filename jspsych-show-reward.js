/**
 * jsPsych plugin bandit task - reward screen
 *
 * Martin Zettersten
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['show-reward'] = (function () {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('show-reward', 'stimulus', 'image');

  plugin.info = {
    name: 'show-reward',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimuli',
        default: undefined,
        array: false,
        description: 'A stimulus is a path to an image file.'
      },
      reward_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Reward Image',
        default: undefined,
        array: false,
        description: 'A stimulus is a path to an image file.'
      },
      canvas_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas size',
        array: true,
        default: [800, 800],
        description: 'Array specifying the width and height of the area that the animation will display in.'
      },
      image_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image size',
        array: true,
        default: [250, 250],
        description: 'Array specifying the width and height of the images to show.'
      },
      rewards: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'rewards',
        array: true,
        default: [2, 4, 6, 8],
        description: 'Array specifying the rewards for each bandit choice'
      },
      cur_reward: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Current Reward',
        array: false,
        default: 8,
        description: 'current reward being shown to participant'
      },
      audio: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Audio',
        default: "stimuli/sparkle_short.wav",
        array: false,
        description: 'audio'
      },
      instruction: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Instruction',
        array: false,
        default: "",
        description: 'instruction shown to participant'
      },
      cur_score: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'cur_score',
        array: false,
        default: 1,
        description: 'current score of participant'
      },
      previous_score: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'previous_score',
        array: false,
        default: 0,
        description: 'previous score of participant'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 2000,
        description: 'How long to show trial before it ends.'
      },
    }
  }

  plugin.trial = function (display_element, trial) {

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    var audio;

    // load audio file
    jsPsych.pluginAPI.getAudioBuffer(trial.audio)
      .then(function (buffer) {
        if (context !== null) {
          audio = context.createBufferSource();
          audio.buffer = buffer;
          audio.connect(context.destination);
        } else {
          audio = buffer;
          audio.currentTime = 0;
        }
        setupTrial();
      })
      .catch(function (err) {
        console.error(`Failed to load audio file "${trial.audio}". Try checking the file path. We recommend using the preload plugin to load audio files.`)
        console.error(err)
      });


    // variable to keep track of timing info and responses
    var start_time = 0;
    var end_time = "NA";
    var reward = "NA";

    var trial_data = {};

    // start timer for this trial
    start_time = performance.now();

    display_element.innerHTML = "<svg id='jspsych-test-canvas' width=" + trial.canvas_size[0] + " height=" + trial.canvas_size[1] + "></svg>";

    var paper = Snap("#jspsych-test-canvas");

    var rect = paper.rect(50, 200, 300, 300, 10);
    rect.attr({
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 5
    });

    var imageLocations = {
      centerLeft: [75, 225],
      centerRight: [425, 225]
    };

    var reward_locations = {
      collect: [750, 650]
    }

    var scoreBoxLength = 480;
    var scoreBox = paper.rect(725, 100, 50, scoreBoxLength, 10, 10);
    scoreBox.attr({
      fill: '#a6760f',
      stroke: "#000",
      strokeWidth: 5,
    });

    var scoreJar = paper.image(
      "stimuli/star_jar.png",
      701,
      600,
      100,
      100);

    var score_index = paper.rect(725, 100 + scoreBoxLength - trial.previous_score, 50, trial.previous_score, 10, 10);
    score_index.attr({
      fill: '#FFFF00',
      stroke: "#000",
      strokeWidth: 0
    });

    var score_border = paper.rect(725, 100, 50, scoreBoxLength, 10, 10);
    //paper.rect(155,50,20,trial.cur_score);
    score_border.attr({
      fill: '#a6760f',
      fillOpacity: 0,
      stroke: "#000",
      strokeWidth: 5
    });

    // var instruction = paper.text(400,125,trial.instruction);
    //   instruction.attr({
    //       "text-anchor": "middle",      
    //       "font-weight": "bold",
    //       "font-size": 20
    //     });

    //create tick marks
    var tick1 = paper.rect(725, 160, 50, 2);
    var tick2 = paper.rect(725, 220, 50, 2);
    var tick3 = paper.rect(725, 280, 50, 2);
    var tick4 = paper.rect(725, 340, 50, 2);
    var tick5 = paper.rect(725, 400, 50, 2);
    var tick6 = paper.rect(725, 460, 50, 2);
    var tick7 = paper.rect(725, 520, 50, 2);


    var image = paper.image(trial.stimulus, imageLocations["centerLeft"][0], imageLocations["centerLeft"][1], trial.image_size[0], trial.image_size[1]);

    var reward_image = paper.image(trial.reward_image, imageLocations["centerRight"][0], imageLocations["centerRight"][1], trial.image_size[0], trial.image_size[1]);

    function animate_reward() {
      // start audio
      if (context !== null) {
        startTime = context.currentTime;
        audio.start(startTime);
      } else {
        audio.play();
      }

      //update index
      var score_index = paper.rect(725, 100 + scoreBoxLength - trial.cur_score, 50, trial.cur_score, 10, 10);
      score_index.attr({
        fill: '#FFFF00',
        stroke: "#000",
        strokeWidth: 0
      });

      //redraw edge border and tick marks

      var score_border = paper.rect(725, 100, 50, scoreBoxLength, 10, 10);
      //paper.rect(155,50,20,trial.cur_score);
      score_border.attr({
        fill: '#a6760f',
        fillOpacity: 0,
        stroke: "#000",
        strokeWidth: 5
      });

    //create tick marks
    var tick1 = paper.rect(725, 160, 50, 2);
    var tick2 = paper.rect(725, 220, 50, 2);
    var tick3 = paper.rect(725, 280, 50, 2);
    var tick4 = paper.rect(725, 340, 50, 2);
    var tick5 = paper.rect(725, 400, 50, 2);
    var tick6 = paper.rect(725, 460, 50, 2);
    var tick7 = paper.rect(725, 520, 50, 2);

      reward_image.animate({
        x: reward_locations["collect"][0],
        y: reward_locations["collect"][1],
        width: 0,
        height: 0
      }, 1000, mina.easeinout, endTrial)
    }

    function endTrial() {
      end_time = performance.now();
      display_element.innerHTML = '';
      var trial_data = {
        //"label": trial.label,
        start_time: start_time,
        end_time: end_time,
        stimulus: trial.stimulus,
        reward: trial.cur_reward,
        reward_image: trial.reward_image,
        score_after_trial: trial.cur_score
      };
      jsPsych.finishTrial(trial_data);
    }

    function setupTrial() {

      jsPsych.pluginAPI.setTimeout(function () {
        animate_reward();
      }, trial.trial_duration);
    };

  };

  return plugin;
})();
