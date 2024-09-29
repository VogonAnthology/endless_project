import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

const Component = videojs.getComponent('Component');

export class TitleBar extends Component {
  // The constructor of a component receives two arguments: the
  // player it will be associated with and an object of options.
  constructor(player: Player, options: any) {
    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!
    super(player, options);

    // If a `text` option was passed in, update the text content of
    // the component.
    if (options.text) {
      this.updateTextContent(options.text);
    }
  }

  // The `createEl` function of a component creates its DOM element.
  override createEl() {
    return videojs.dom.createEl('div', {
      // Prefixing classes of elements within a player with "vjs-"
      // is a convention used in Video.js.
      className: 'vjs-title-bar',
    });
  }

  // This function could be called at any time to update the text
  // contents of the component.
  updateTextContent(text: any) {
    // If no text was provided, default to "Title Unknown"
    if (typeof text !== 'string') {
      text = 'Title Unknown';
    }

    // Use Video.js utility DOM methods to manipulate the content
    // of the component's element.
    videojs.dom.emptyEl(this.el());
    videojs.dom.appendContent(this.el(), text);
  }
}

videojs.registerComponent('TitleBar', TitleBar);

export function createTitleBar(player: Player, options: any): TitleBar {
  const titleBar = new TitleBar(player, options);
  player.addChild(titleBar);
  return titleBar;
}
// const Button = videojs.getComponent('Button');
// // Define a new custom button component
// class LikeButton extends videojs.getComponent('Button') {
//   constructor(player: Player, options: any) {
//     super(player, options);
//     this.controlText('Like');
//     this.addClass('vjs-like-button');
//   }

//   handleClick() {
//     console.log('Liked!');
//   }

//   createEl() {
//     return super.createEl('button', {
//       className: 'vjs-like-button vjs-control',
//       innerHTML: '<i class="fa fa-thumbs-up"></i>',
//     });
//   }
// }

// // Define a new custom button component for settings
// class SettingsButton extends videojs.getComponent('Button') {
//   constructor(player, options) {
//     super(player, options);
//     this.controlText('Settings');
//     this.addClass('vjs-settings-button');
//   }

//   handleClick() {
//     console.log('Settings clicked');
//     // Open a settings modal
//   }

//   createEl() {
//     return super.createEl('button', {
//       className: 'vjs-settings-button vjs-control',
//       innerHTML: '<i class="fa fa-cog"></i>',
//     });
//   }
// }

// // Register the custom components
// videojs.registerComponent('LikeButton', LikeButton);
// videojs.registerComponent('SettingsButton', SettingsButton);
