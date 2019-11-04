import React, { useReducer, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(
        ingredient => ingredient.id !== action.id
      );
    default:
      throw new Error("Should not get there!");
  }
};

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...curHttpState, loading: false };
    case "ERROR":
      return { loading: false, error: action.errorMessage };
    case "CLEAR":
      return { ...curHttpState, error: null };
    default:
      throw new Error("SHOULD NOT BE REACHED!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null
  });

  const filteredIngredients = useCallback(filteredIngredients => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = ingredient => {
    dispatchHttp({ action: "SEND" });
    fetch("https://react-hooks-3eeb2.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-type": "application/json" }
    })
      .then(response => {
        dispatchHttp({ action: "RESPONSE" });
        return response.json();
      })
      .then(responseData => {
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient }
        });
      })
      .catch(err => {
        dispatchHttp({
          type: "ERROR",
          errorMessage: "Something went wrong!"
        });
      });
  };

  const removeIngredientHandler = ingredientId => {
    dispatchHttp({ type: "SEND" });
    fetch(
      `https://react-hooks-3eeb2.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "delete",
        headers: { "Content-type": "application/json" }
      }
    )
      .then(response => {
        dispatchHttp({ type: "RESPONSE" });
        return response.json();
      })
      .then(responseData => {
        dispatch({ type: "DELETE", id: ingredientId });
      })
      .catch(err => {
        dispatchHttp({
          type: "ERROR",
          errorMessage: "Something went wrong!"
        });
      });
  };

  const clearError = () => {
    dispatchHttp({ type: "CLEAR" });
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredients} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
