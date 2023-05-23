import React, {Fragment} from "react";
import classNames from "classnames";
import {Combobox, Transition} from "@headlessui/react";
import styles from "@/styles/components/combobox.module.scss"

export default function ComboBox({recipe, ingredient, updateIngredient}) {
    const [filteredIngredients, setFilteredIngredients] = React.useState([])
    const [query, setQuery] = React.useState("")

    const queryIngredients = (query) => {
        setQuery(query)
        fetch(`/api/dashboard/recipes/ingredients?query=${query}`)
            .then(res => res.json())
            .then(data => {
                setFilteredIngredients(data.data)
            })
            .catch(err => {
                // TODO: handle error
            })
    }
    const setIngredient = (e) => {
        if (e === null) {
            // create new ingredient
            fetch(`/api/dashboard/recipes/ingredients`, {
                method: "POST",
                body: JSON.stringify({
                    name: query.toLowerCase()
                })
            })
                .then(res => res.json())
                .then(data => {
                    updateIngredient(data.data.id, "select", ingredient.i, data.data.name)
                })
                .catch(err => {
                    //TODO: handle error
                })
        } else {
            // get ingredient from filtered
            let query = filteredIngredients.find(i => i.id === e)

            updateIngredient(e, "select", ingredient.i, query.name)
        }
    }

    return (
        <Combobox value={ingredient.name} className={styles.combobox} onChange={(e) => setIngredient(e)}>
            <div className={styles.combocontainer}>
                <Combobox.Input onChange={(e) => queryIngredients(e.target.value)} placeholder={'Search ingredients'}></Combobox.Input>
                <Combobox.Button className={styles.combobutton}>
                    <span className={styles.selecticon}>
                            <svg id="uuid-e62a5d97-6036-4036-944d-9bd824f5c8aa" viewBox="0 0 256 426.67" width={8}>
                                <path d="m128,426.67c-6.4,0-10.67-2.13-14.93-6.4L6.4,313.6c-8.53-8.53-8.53-21.33,0-29.87s21.33-8.53,29.87,0l91.73,91.73,91.73-91.73c8.53-8.53,21.33-8.53,29.87,0s8.53,21.33,0,29.87l-106.67,106.67c-4.27,4.27-8.53,6.4-14.93,6.4h0Z"/>
                                <path d="m21.33,149.33c-6.4,0-10.67-2.13-14.93-6.4-8.53-8.53-8.53-21.33,0-29.87L113.07,6.4c8.53-8.53,21.33-8.53,29.87,0l106.67,106.67c8.53,8.53,8.53,21.33,0,29.87s-21.33,8.53-29.87,0l-91.73-91.73-91.73,91.73c-4.27,4.27-8.53,6.4-14.93,6.4h0Z"/>
                            </svg>
                      </span>
                </Combobox.Button>
                <Combobox.Options className={styles.combooptions}>
                    {filteredIngredients.length === 0 && query.length > 0 &&
                        <Combobox.Option className={styles.combooption} value={null}>
                            Add {query}
                        </Combobox.Option>
                    }


                    {filteredIngredients && filteredIngredients.map((ingredient) => (
                        <Combobox.Option key={ingredient.id} value={ingredient.id} className={styles.combooption}>
                            {ingredient.name}
                        </Combobox.Option>
                    ))}
                    {query.length > 0 && filteredIngredients.find(i => i.name !== query) &&
                        <Combobox.Option className={styles.combooption} value={null}>
                            Add {query}
                        </Combobox.Option>
                    }
                </Combobox.Options>
            </div>
        </Combobox>
    )

}
