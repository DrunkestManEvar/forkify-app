import View from './view.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  _generateMarkup() {
    const currPage = this._data.page;
    const numPages = Math.ceil(
      this._data.recipes.length / this._data.recipesPerPage
    );

    // Page 1 and there are other pages
    if (currPage === 1 && numPages > 1) {
      return this._generatePaginationBtn('next', currPage);
    }

    // In-between page
    if (currPage > 1 && currPage < numPages) {
      return this._generatePaginationBtn('prev', currPage)
        .concat(this._generatePaginationBtn('next', currPage))
        .concat(this._generateCurrentPageNum(currPage, numPages));
    }

    // Last page
    if (currPage === numPages && numPages > 1) {
      return this._generatePaginationBtn('prev', currPage);
    }

    // Page 1 and the are no more pages
    return '';
  }

  _generatePaginationBtn(type, currPage) {
    return `
      <button data-goto="${
        type === 'prev' ? currPage - 1 : currPage + 1
      }" class="btn--inline pagination__btn--${type}">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-${
      type === 'prev' ? 'left' : 'right'
    }"></use>
        </svg>
        <span>Page ${type === 'prev' ? currPage - 1 : currPage + 1}</span>
      </button>
    `;
  }

  _generateCurrentPageNum(currPage, numPages) {
    return `
    <button class="btn--inline pagination__btn--curr">
      <span>Page ${currPage} / ${numPages}</span>
    </button>
    `;
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn || btn.classList.contains('pagination__btn--curr')) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }
}

export default new PaginationView();
