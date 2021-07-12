import "./styles/index.css";
import "./styles/reset.css";
type Product = {
  id: string;
  name: string;
  price: number;
  type: string;
};

type CartItem = {
  id: string;
  quantity: number;
};
let state: { products: Product[]; cartItems: CartItem[] } = {
  products: [
    {
      id: "001-beetroot",
      name: "beetroot",
      price: 0.35,
      type: "vegetable",
    },
    {
      id: "002-carrot",
      name: "carrot",
      price: 1,
      type: "vegetable",
    },
    {
      id: "003-apple",
      name: "apple",
      price: 0.5,
      type: "fruit",
    },
    {
      id: "004-apricot",
      name: "apricot",
      price: 0.5,
      type: "fruit",
    },
    {
      id: "005-avocado",
      name: "avocado",
      price: 0.9,
      type: "fruit",
    },
    {
      id: "006-bananas",
      name: "bananas",
      price: 0.7,
      type: "fruit",
    },
    {
      id: "007-bell-pepper",
      name: "bell-pepper",
      price: 0.3,
      type: "vegetable",
    },

    {
      id: "008-berry",
      name: "berry",
      price: 1.5,
      type: "fruit",
    },
    {
      id: "009-blueberry",
      name: "blueberry",
      price: 1.5,
      type: "fruit",
    },
    {
      id: "010-eggplant",
      name: "eggplant",
      price: 0.8,
      type: "vegetable",
    },
  ],

  cartItems: [],
};

function renderAllProducts() {
  for (const product of state.products) {
    let productLi = renderProduct(product);

    let itemUl = document.querySelector(".store--item-list");
    itemUl?.append(productLi);
  }
}

function renderProduct(product: {
  id: string;
  name: string;
  price: number;
  type: string;
}) {
  let productLi = document.createElement("li");

  let productImgDiv = document.createElement("div");
  productImgDiv.setAttribute("class", "store--item-icon");

  let productImg = document.createElement("img");
  productImg.setAttribute("src", `assets/icons/${product.id}.svg`);
  productImg.setAttribute("alt", product.name);
  productImgDiv.append(productImg);

  let addBtn = document.createElement("button");
  addBtn.innerText = "Add to cart";

  addBtn.addEventListener("click", function (event) {
    event.preventDefault();

    let itemIndex = checkExistCart(product);

    if (itemIndex === -1) {
      const newCartItem = addNewProductToCart(product);
      renderCartItem(newCartItem);
      updateTotal();
    } else {
      addQuantity(product.id);
    }
  });

  productLi.append(productImgDiv, addBtn);
  return productLi;
}

function addQuantity(id: string) {
  let updatedCartItem = state.cartItems.find(function (item) {
    return item.id === id;
  });

  if (updatedCartItem) {
    updatedCartItem.quantity++;
    updateCartItem(updatedCartItem);
  }
}

function minusQuantity(id: string) {
  let updatedCartItem = state.cartItems.find(function (item) {
    return item.id === id;
  });

  if (updatedCartItem) {
    updatedCartItem.quantity--;
    updateCartItem(updatedCartItem);
  }
}

function renderAllCartItems() {
  getServerCart().then(function (serverCart) {
    state.cartItems = serverCart;

    state.cartItems.map(renderCartItem);
  });
}

function renderCartItem(cartItem: CartItem) {
  let cartUl = document.querySelector(".cart--item-list");
  let cartLi = document.createElement("li");
  cartLi.setAttribute("id", cartItem.id);
  cartUl?.append(cartLi);

  let productDetail = state.products.find(function (product) {
    return product.id === cartItem.id;
  });
  if (!productDetail) return;
  let cartItemImg = document.createElement("img");
  cartItemImg.setAttribute("class", "cart--item-icon");
  cartItemImg.setAttribute("src", `assets/icons/${cartItem.id}.svg`);
  cartItemImg.setAttribute("alt", productDetail.name);

  let itemName = document.createElement("p");
  itemName.innerText = productDetail.name;

  let minusBtn = document.createElement("button");
  minusBtn.setAttribute("class", "quantity-btn remove-btn center");
  minusBtn.innerText = "-";
  minusBtn.addEventListener("click", function (event) {
    event.preventDefault();
    minusQuantity(cartItem.id);
  });

  let plusBtn = document.createElement("button");
  plusBtn.setAttribute("class", "quantity-btn remove-btn center");
  plusBtn.innerText = "+";
  plusBtn.addEventListener("click", function (event) {
    event.preventDefault();
    addQuantity(cartItem.id);
  });

  let quantitySpan = document.createElement("span");
  quantitySpan.setAttribute("class", "quantity-text center");
  quantitySpan.innerText = cartItem.quantity;

  cartLi.append(cartItemImg, itemName, minusBtn, quantitySpan, plusBtn);
}

function checkExistCart(product) {
  const itemIndex = state.cartItems.findIndex(function (cartItem) {
    return cartItem.id === product.id;
  });

  return itemIndex;
}

function addNewProductToCart(product) {
  let cartItem = {
    id: product.id,
    quantity: 1,
  };

  postItemToServer(cartItem)
    .then(function (serverItem) {
      state.cartItems.push(serverItem);
    })
    .then(function () {
      updateTotal();
    });

  return cartItem;
}

function updateCartItem(updatedItem) {
  let itemIndex = state.cartItems.findIndex(function (object) {
    return object.id === updatedItem.id;
  });
  let itemLi = document.getElementById(`${updatedItem.id}`);

  if (updatedItem.quantity >= 1) {
    patchCartItemToServer(updatedItem)
      .then(function (serverItem) {
        state.cartItems[itemIndex] = serverItem;

        let itemQuantity = itemLi.querySelector(".quantity-text");
        itemQuantity.innerText = serverItem.quantity;
      })
      .then(function () {
        updateTotal();
      });
  }
  if (updatedItem.quantity === 0) {
    delItemFromServer(updatedItem).then(function () {
      state.cartItems.splice(itemIndex, 1);
      itemLi.remove();
      updateTotal();
    });
  }
}

function updateTotal() {
  let totalEl = document.querySelector(".total-number");

  let totalPrice = 0;

  for (item of state.cartItems) {
    let productDetail = state.products.find(function (product) {
      return product.id === item.id;
    });

    totalPrice = totalPrice + productDetail.price * item.quantity;
  }

  totalEl.innerText = `£${totalPrice.toFixed(2)}`;
}

function getServerCart() {
  return fetch("http://localhost:4000/cartItems")
    .then(function (response) {
      return response.json();
    })
    .catch((error) => {
      console.log(error);
      alert("There is something wrong.....");
    });
}

function postItemToServer(item) {
  return fetch(`http://localhost:4000/cartItems/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.log(error);
      alert("There is something wrong.....");
    });
}

function patchCartItemToServer(item) {
  return fetch(`http://localhost:4000/cartItems/${item.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.log(error);
      alert("There is something wrong.....");
    });
}

function delItemFromServer(item) {
  return fetch(`http://localhost:4000/cartItems/${item.id}`, {
    method: "DELETE",
  }).catch((error) => {
    console.log(error);
    alert("There is something wrong.....");
  });
}

function displayFilterSortSection() {
  let h1El = document.querySelector("h1");

  let filterPara = document.createElement("p");
  filterPara.innerText = "Filter by: ";

  let filterDiv = document.createElement("div");
  filterDiv.setAttribute("class", "filter-container");

  let vegBtn = document.createElement("button");
  vegBtn.setAttribute("id", "vegetable");
  vegBtn.innerText = "Vegetables";
  vegBtn.addEventListener("click", function (event) {
    event.preventDefault();
    filterProduct("vegetable");
  });

  let fruitBtn = document.createElement("button");
  fruitBtn.innerText = "Fruits";
  fruitBtn.addEventListener("click", function (event) {
    event.preventDefault();
    filterProduct("fruit");
  });

  filterDiv.append(filterPara, vegBtn, fruitBtn);
  h1El.after(filterDiv);

  let sortPara = document.createElement("p");
  sortPara.innerText = "Sort by: ";

  let sortDiv = document.createElement("div");
  sortDiv.setAttribute("class", "filter-container");

  let lowPriceBtn = document.createElement("button");
  lowPriceBtn.innerText = "Lowest price";
  lowPriceBtn.addEventListener("click", function (event) {
    event.preventDefault();
    sortProductByPrice();

    let storeUl = document.querySelector(".store--item-list");
    let allProductLi = storeUl.querySelectorAll("li");
    allProductLi.forEach(removeLi);

    for (product of state.products) {
      let productLi = renderProduct(product);
      let itemUl = document.querySelector(".store--item-list");
      itemUl.append(productLi);
    }
  });

  let highPriceBtn = document.createElement("button");
  highPriceBtn.innerText = "Highest price";
  highPriceBtn.addEventListener("click", function (event) {
    event.preventDefault();
    sortProductByPrice();

    let storeUl = document.querySelector(".store--item-list");
    let allProductLi = storeUl.querySelectorAll("li");
    allProductLi.forEach(removeLi);

    for (product of state.products) {
      let productLi = renderProduct(product);
      let itemUl = document.querySelector(".store--item-list");
      itemUl.prepend(productLi);
    }
  });
  sortDiv.append(sortPara, lowPriceBtn, highPriceBtn);
  h1El.after(sortDiv);
}

function sortProductByPrice() {
  state.products.sort(function (a, b) {
    return a.price - b.price;
  });

  console.log(state.products);
}

function filterProduct(type) {
  let storeUl = document.querySelector(".store--item-list");
  let allProductLi = storeUl.querySelectorAll("li");
  allProductLi.forEach(removeLi);

  for (product of state.products) {
    if (type === product.type) {
      let productLi = renderProduct(product);
      let itemUl = document.querySelector(".store--item-list");
      itemUl.append(productLi);
    }
  }
}

function removeLi(liEl) {
  liEl.remove();
}

displayFilterSortSection();
renderAllProducts();
renderAllCartItems();

// function emptyServerCart(){
// return  fetch("http://localhost:3000/cartItems")
//     .then(response => response.json())
//     .then(function(oldItemsArray){
//       for (oldItem of oldItemsArray){
//         delItemFromServer(oldItem)
//       }
//     })
//     .catch((error) => {
//         console.log(error)
//         alert("There is something wrong.....")
//       });
// }

// let state: {
//   storeItems: string[];
//   cartItems: {}[];
// } = {
//   storeItems: [
//     "001-beetroot",
//     "002-carrot",
//     "003-apple",
//     "004-apricot",
//     "005-avocado",
//     "006-bananas",
//     "007-bell-pepper",
//     "008-berry",
//     "009-blueberry",
//     "010-eggplant",
//   ],
//   cartItems: [],
// };

// const setState = (newState: object) => {
//   state = { ...state, ...newState };
// };

// const storeList =
//   document.querySelector<HTMLDataListElement>(".store--item-list")!;

// function renderStoreItem(id: string) {
//   let storeItem = document.createElement("li");
//   storeItem.innerHTML = `<div class="store--item-icon">
//      <img src="assets/icons/${id}.svg" alt="${id}" />
//      </div>
//     <button>Add to cart</button>`;

//   let addCartBtn = storeItem.querySelector<HTMLButtonElement>("button");
//   if (addCartBtn)
//     addCartBtn.addEventListener("click", () => {
//       let newCartItem = { id, quantity: 1 };
//       setState({ cartItems: [...state.cartItems, newCartItem] });
//       console.log(state);
//     });
//   storeList.append(storeItem);
// }

// function renderAllStoreItems() {
//   state.storeItems.map((id) => renderStoreItem(id));
// }

// renderAllStoreItems();
