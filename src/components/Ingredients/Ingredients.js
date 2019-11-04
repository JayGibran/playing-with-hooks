import React, { useState, useReducer, useCallback } from "react";

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

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const filteredIngredients = useCallback(filteredIngredients => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch("https://react-hooks-3eeb2.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-type": "application/json" }
    })
      .then(response => {
        setIsLoading(false);
        return response.json();
      })
      .then(responseData => {
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient }
        });
      })
      .catch(err => {
        setIsLoading(false);
        setError("Something went wrong!");
      });
  };

  const removeIngredientHandler = ingredientId => {
    setIsLoading(true);
    fetch(
      `https://react-hooks-3eeb2.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "delete",
        headers: { "Content-type": "application/json" }
      }
    )
      .then(response => {
        setIsLoading(false);
        return response.json();
      })
      .then(responseData => {
        dispatch({ type: "DELETE", id: ingredientId });
      })
      .catch(err => {
        setIsLoading(false);
        setError("Something went wrong!");
      });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
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
