import icons from 'url:../../img/icons.svg';
import { HIDE_WINDOW_SECS } from '../config';

export default class View {
  _data;

  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();
    const newDOM = document.createRange().createContextualFragment(newMarkup);

    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const currentElements = Array.from(
      this._parentElement.querySelectorAll('*')
    );

    newElements.forEach((newEl, index) => {
      const currEl = currentElements[index];
      if (
        !newEl.isEqualNode(currEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        currEl.textContent = newEl.textContent;
      }

      if (!newEl.isEqualNode(currEl)) {
        Array.from(newEl.attributes).forEach(attr => {
          currEl.setAttribute(attr.name, attr.value);
        });
      }
    });
  }

  renderSpinner() {
    const spinnerHTML = `
    <div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>
  `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', spinnerHTML);
  }

  renderError(message = this._errorMessage) {
    const errorMsgHTML = `
    <div class="error">
      <div>
        <svg>
          <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', errorMsgHTML);
  }

  renderMessage(message = this._message, reverseChanges = false) {
    const msgHTML = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', msgHTML);
    if (reverseChanges) {
      setTimeout(() => {
        this._clear();
        this._parentElement.insertAdjacentHTML(
          'afterbegin',
          this._originalHTML
        );
      }, HIDE_WINDOW_SECS * 1500);
    }
  }

  _captureOriginalHTML() {
    this._originalHTML = this._parentElement.innerHTML;
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }
}
