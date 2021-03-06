import React, { Component } from 'react';
import html2canvas from 'html2canvas';
import interact from 'interactjs';
import LazyLoad from 'react-lazy-load';
import { saveAs } from 'file-saver';
import base64 from '../helpers/base64Image';
import { MemeContext } from '../provider/MemeProvider';

import UploadButton from '../layout/UploadButton';
import ImageLoader from '../layout/ImageLoader';

class MemePanel extends Component {
  state = {
    topText: 'TOP TEXT',
    topTextColor: '#ffffff',
    bottomText: 'BOTTOM TEXT',
    bottomTextColor: '#ffffff',
    baseImage: ''
  };

  componentDidMount() {
    if ('localStorage' in window && localStorage.getItem('memeSettings')) {
      const memeSettings = JSON.parse(localStorage.getItem('memeSettings'));
      this.setState(() => ({ ...memeSettings }));
    }
   
    this.interactElement(this.meme__top_text);
    this.interactElement(this.meme__bottom_text);
  }

  componentDidUpdate() {
    if ('localStorage' in window) {
      localStorage.setItem('memeSettings', JSON.stringify(this.state));
    }
  }

  onTopTextChange = (e) => {
    const topText = e.target.value;
    this.setState(() => ({ topText }));
  };

  onBottomTextChange = (e) => {
    const bottomText = e.target.value;
    this.setState(() => ({ bottomText }));
  };

  onSaveHandler = () => {
    this.save__button.disabled = true;
    this.save__button.textContent = 'Saving Meme ...';
    html2canvas(this.meme__image)
      .then((canvas) => {
        // const myImage = canvas.toDataURL('image/png');
        this.save__button.disabled = false;
        this.save__button.textContent = 'Save Meme';
        const date = new Date().getTime(); 
        canvas.toBlob((blob) => {
          saveAs(blob, `meme-${date}.png`);
        });
      });
  };

  onTopTextColorChange = (e) => {
    const color = e.target.value;
    this.setState(() => ({ topTextColor: color }));
  };

  onBottomTextColorChange = (e) => {
    const color = e.target.value;
    this.setState(() => ({ bottomTextColor: color }));
  };

  interactElement = (element) => {
    interact(element)
      .draggable({
        snap: {
          targets: [
            interact.createSnapGrid({ x: 10, y: 10 })
          ],
          range: Infinity,
          relativePoints: [{ x: 0, y: 0 }]
        },
        restrict: {
          restriction: 'parent',
          elementRect: { 
            top: 0, 
            left: 0, 
            bottom: 1, 
            right: 1 
          }
        },
        onmove: this.dragMoveListener
      })
      .pointerEvents({
        ignoreFrom: '[no-pointer-event]'
      })
      .resizable({
        edges: { 
          left: true, 
          right: true, 
          bottom: true, 
          top: true 
        },
        restrictEdges: {
          outer: 'parent',
          endOnly: true
        },
        inertia: true
      })
      .on('resizemove', this.onResizeMove)
      .on('resizeend', this.onResizeEnd);
  };

  onResizeMove = (event) => {
    const targetElement = event.target;
    let x = (parseFloat(targetElement.getAttribute('data-x')) || 0);
    let y = (parseFloat(targetElement.getAttribute('data-y')) || 0);

    // update the element's style
    targetElement.style.width = `${event.rect.width}px`;
    targetElement.style.height = `${event.rect.height}px`;

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    targetElement.style.transform = `'translate(${x}px, ${y}px)`;
    targetElement.style.border = '3px dashed #4c8ade';
    targetElement.setAttribute('data-x', x);
    targetElement.setAttribute('data-y', y);

    // Scale font size
    this.setScaledFont(targetElement, 0.35);
  };

  onResizeEnd = (event) => {
    const targetElement = event.target;
    targetElement.style.border = '3px dashed transparent';
  };

  dragMoveListener = (event) => {
    const targetElement = event.target;
    const x = (parseFloat(targetElement.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(targetElement.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    targetElement.style.transform = `translate(${x}px, ${y}px)`;

    // update the posiion attributes
    targetElement.setAttribute('data-x', x);
    targetElement.setAttribute('data-y', y);
  };

  setScaledFont = (targetElement, scale) => {
    const size = targetElement.offsetWidth;
    const fs = size * scale;
    /* eslint-disable */
    targetElement.style.fontSize = `${fs}%`;
    /* eslint-enable */
    // return this;
  };

  render() {
    const { 
      topText, 
      bottomText,
      topTextColor,
      bottomTextColor,
      baseImage 
    } = this.state;
    return (
      <div className="meme__panel">
        <MemeContext.Consumer>
          {({ selectedMeme, setSelectedImage }) => {
            base64(selectedMeme.url).then((base64Img) => {
              this.setState(() => ({ baseImage: base64Img }));
            });
            return (
              <React.Fragment>
                <div 
                    className="meme__editor"
                    /* eslint-disable */
                    ref={node => this.meme__image = node}
                    /* eslint-enable */
                >
                  <div 
                      className="meme__top-text"
                      draggable="true"
                      /* eslint-disable */
                      ref={node => this.meme__top_text = node }
                      /* eslint-enable */
                  >
                    <h1 
                        className="meme__text"
                        style={{
                          color: topTextColor
                        }}>
                      {topText}
                    </h1>
                  </div>
                  <LazyLoad 
                      debounce={false}
                      offsetVertical={250}
                    >
                      <ImageLoader 
                          alt=""
                          className="meme__image-selected"
                          src={baseImage} 
                      />
                  </LazyLoad>
                  <div 
                      className="meme__bottom-text"
                      draggable="true"
                      /* eslint-disable */
                      ref={node => this.meme__bottom_text = node }
                      /* eslint-enable */
                  >
                    <h1 
                        className="meme__text"
                        style={{
                          color: bottomTextColor
                        }}>
                    {bottomText}
                    </h1>
                  </div>
                </div>
                <div className="meme__form">
                  <div className="meme__form-control">
                    <span className="meme__form-title">Top Text</span>  
                    <div className="meme__form-wrapper">
                      <input 
                          onChange={this.onTopTextChange}
                          placeholder="Top Text"
                          type="text" 
                          value={topText}
                      />
                      <input
                          onChange={this.onTopTextColorChange} 
                          style={{ marginLeft: '15px' }}
                          type="color"
                          value={topTextColor}
                      />
                    </div>
                  </div>
                  <div className="meme__form-control">  
                    <span className="meme__form-title">Top Text</span> 
                    <div className="meme__form-wrapper">
                      <input 
                          onChange={this.onBottomTextChange}
                          placeholder="Bottom Text"
                          type="text" 
                          value={bottomText}
                      />
                      <input 
                          onChange={this.onBottomTextColorChange}
                          style={{ marginLeft: '15px' }}
                          type="color"
                          value={bottomTextColor}
                      />
                    </div>
                  </div>
                  <div className="meme__form-control">
                      <UploadButton setSelectedImage={setSelectedImage}/>
                  </div>
                  <br/>
                  <div className="meme__form-control">
                    <button 
                        onClick={this.onSaveHandler}
                        /* eslint-disable */
                        ref={node => this.save__button = node}
                        /* eslint-enable */
                    >
                    Save Meme
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          }}
        </MemeContext.Consumer>
      </div>
    );
  }
}

export default MemePanel;
