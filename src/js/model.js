import { API_URL, API_KEY } from './config.js';
import { AJAX } from './helpers.js';
import { RESULTS_PER_PAGE } from './config.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    recipes: [],
    page: 1,
    recipesPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
};

const formatRecipe = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    cookingTime: recipe.cooking_time,
    image: recipe.image_url,
    ingredients: recipe.ingredients,
    publisher: recipe.publisher,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    title: recipe.title,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const url = `${API_URL}${id}?key=${API_KEY}`;
    const data = await AJAX(url);

    state.recipe = formatRecipe(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  state.recipe.bookmarked = true;

  persistBookmarks();
};

export const removeBookmark = function (id) {
  const index = state.bookmarks.findIndex(recipe => recipe.id === id);
  state.bookmarks.splice(index, 1);

  state.recipe.bookmarked = false;

  persistBookmarks();
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
  });

  state.recipe.servings = newServings;
};

export const loadSearchResults = async function (query) {
  try {
    const url = `${API_URL}?search=${query}&key=${API_KEY}`;
    const data = await AJAX(url);

    const { recipes } = data.data;

    state.search.query = query;
    state.search.recipes = recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.recipesPerPage;
  const end = page * state.search.recipesPerPage;

  return state.search.recipes.slice(start, end);
};

export const uploadNewRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArray = ing[1].split(',').map(el => el.trim());

        if (ingArray.length !== 3)
          throw new Error('Wrong ingredient format! Please try again :)');

        const [quantity, unit, description] = ingArray;
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    const recipeToUpload = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: newRecipe.cookingTime,
      servings: newRecipe.servings,
      key: API_KEY,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipeToUpload);

    state.recipe = formatRecipe(data);
    console.log(state.recipe);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
};

init();
