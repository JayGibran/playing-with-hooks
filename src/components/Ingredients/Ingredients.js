import React, { useState, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);

  const filteredIngredients = useCallback(filteredIngredients => {
    setIngredients(filteredIngredients);
  }, []);

  const addIngredientHandler = ingredient => {
    fetch("https://react-hooks-3eeb2.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-type": "application/json" }
    })
      .then(response => response.json())
      .then(responseData => {
        setIngredients(prevIngredients => [
          ...prevIngredients,
          { id: responseData.name, ...ingredient }
        ]);
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />

      <section>
        <Search onLoadIngredients={filteredIngredients} />
        <IngredientList ingredients={ingredients} onRemoveItem={() => {}} />
      </section>
    </div>
  );
}

export default Ingredients;
