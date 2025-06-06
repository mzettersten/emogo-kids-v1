/**
 * jsPsych plugin knowledge check for bandit task
 *
 * Martin Zettersten
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['knowledge-choice'] = (function () {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('knowledge-choice', 'stimuli', 'image');

  plugin.info = {
    name: 'knowledge-choice',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
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
      reward_scores: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'reward scores',
        array: true,
        default: [8, 16, 32, 64],
        description: 'Array specifying the adjusted rewards (with depiction factor) for each bandit choice'
      },
      rewards: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'rewards',
        array: true,
        default: [8, 16, 32, 64],
        description: 'Array specifying the adjusted rewards (without the depiction factor) for each bandit choice'
      },
      reward_scores_unadjusted: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'reward scores unadjusted',
        array: true,
        default: [8, 16, 32, 64],
        description: 'Array specifying the unadjusted rewards for each bandit choice'
      },
      reward_images: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'reward images',
        array: true,
        default: ["stimuli/stars_2.png", "stimuli/stars_4.png", "stimuli/stars_6.png", "stimuli/stars_8.png"],
        description: 'Array specifying the reward images for each trial'
      },
      emotions: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Emotions',
        array: true,
        default: [],
        description: 'Array specifying the emotions associated with each bandit choice'
      },
      models: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Models',
        array: true,
        default: [],
        description: 'Array specifying the models associated with each bandit choice'
      },
      instruction: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Instruction',
        array: false,
        default: "",
        description: 'instruction shown to participant'
      }
    }
  }

  plugin.trial = function (display_element, trial) {

    // variable to keep track of timing info and responses
    var start_time = 0;
    var responses = [];
    var choice = "NA";
    var choiceLocation = "NA";
    var rt = "NA";
    var end_time = "NA";
    var reward_score = "NA";
    var choice_index = "NA";

    var trial_data = {};

    // start timer for this trial
    start_time = performance.now();

    display_element.innerHTML = "<svg id='jspsych-test-canvas' width=" + trial.canvas_size[0] + " height=" + trial.canvas_size[1] + "></svg>";

    var paper = Snap("#jspsych-test-canvas");

    var rect1 = paper.rect(25, 75, 300, 300, 10);
    rect1.attr({
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 5
    });

    var rect2 = paper.rect(375, 75, 300, 300, 10);
    rect2.attr({
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 5
    });

    var rect3 = paper.rect(25, 425, 300, 300, 10);
    rect3.attr({
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 5
    });

    var rect4 = paper.rect(375, 425, 300, 300, 10);
    rect4.attr({
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 5
    });

    var imageLocations = {
      topleft: [50, 100],
      topright: [400, 100],
      bottomleft: [50, 450],
      bottomright: [400, 450],

    };


    var instruction = paper.text(350, 25, trial.instruction);
    instruction.attr({
      "text-anchor": "middle",
      "font-weight": "bold",
      "font-size": 20
    });

    var image1 = paper.image(trial.stimuli[0], imageLocations["topleft"][0], imageLocations["topleft"][1], trial.image_size[0], trial.image_size[1]);
    var image2 = paper.image(trial.stimuli[1], imageLocations["topright"][0], imageLocations["topright"][1], trial.image_size[0], trial.image_size[1]);
    var image3 = paper.image(trial.stimuli[2], imageLocations["bottomleft"][0], imageLocations["bottomleft"][1], trial.image_size[0], trial.image_size[1]);
    var image4 = paper.image(trial.stimuli[3], imageLocations["bottomright"][0], imageLocations["bottomright"][1], trial.image_size[0], trial.image_size[1]);


    image1.click(function () {
      choice_index = 0;
      rect1.attr({
        fill: "#00ccff",
        "fill-opacity": 0.5
      });
      choice = trial.stimuli[0];
      choiceLocation = "pos1";
      reward_score = trial.reward_scores[0];
      inputEvent();
    });

    image2.click(function () {
      choice_index = 1;
      rect2.attr({
        fill: "#00ccff",
        "fill-opacity": 0.5
      });
      choice = trial.stimuli[1];
      choiceLocation = "pos2";
      reward_score = trial.reward_scores[1];
      inputEvent();
    });

    image3.click(function () {
      choice_index = 2;
      rect3.attr({
        fill: "#00ccff",
        "fill-opacity": 0.5
      });
      choice = trial.stimuli[2];
      choiceLocation = "pos3";
      reward_score = trial.reward_scores[2];
      inputEvent();
    });

    image4.click(function () {
      choice_index = 3;
      rect4.attr({
        fill: "#00ccff",
        "fill-opacity": 0.5
      });
      choice = trial.stimuli[3];
      choiceLocation = "pos4";
      reward_score = trial.reward_scores[3];
      inputEvent();

    });

    function inputEvent() {
      image1.unclick();
      image2.unclick();
      image3.unclick();
      image4.unclick();


      end_time = performance.now();
      rt = end_time - start_time;
      setTimeout(function () {
        endTrial();
      }, 300);
    }


    function endTrial() {


      display_element.innerHTML = '';


      var trial_data = {
        //"label": trial.label,
        start_time: start_time,
        end_time: end_time,
        stimuli: trial.stimuli,
        image1: trial.stimuli[0],
        image2: trial.stimuli[1],
        image3: trial.stimuli[2],
        image4: trial.stimuli[3],
        choiceLocation: choiceLocation,
        choiceImage: choice,
        choiceEmotion: trial.emotions[choice_index],
        choiceModel: trial.models[choice_index],
        choice_index: choice_index,
        rt: rt,
        reward_score: reward_score,
        reward: trial.rewards[choice_index],
        reward_score_unadjusted: trial.reward_scores_unadjusted[choice_index],
        reward_image: trial.reward_images[choice_index]

      };

      jsPsych.finishTrial(trial_data);

    }
  };

  return plugin;
})();
