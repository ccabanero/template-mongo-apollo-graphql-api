
## GraphQL Playground Snippets

Plut the following into the GraphQL Playground interface to understand the features of the template GraphQL API provided in this repo.

Sign up:

````
mutation signup {
  signup(
    input: {
      firstName: "Johnny"
      lastName: "Appleseed"
      email: "johnnyappleseed@gmail.com"
      password: "123456"
    }
  ) {
    firstName
    lastName
    email
  }
}
````

Log in

````
mutation login {
  login(input: { email: "johnnyappleseed@gmail.com", password: "123456" }) {
    token
  }
}
````

Get User:

````
query getUser {
  user {
    id
    firstName
    lastName
    email
    sales {
      address
      latitude
      longitude
      type
      categories
      desc
      year
      createdAt
      updatedAt
    }
    isAdmin
    createdAt
    updatedAt
  }
}

````

with HTTP headers (replace token):

````
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNsaW50QGdtYWlsLmNvbSIsImlhdCI6MTU3NjQ2MzYwMywiZXhwIjoxNTc2NTUwMDAzfQ.MQm58KR1flXZOm8o13_npyZy8iQf5ir1agYAe7hkmvs"
}
````

Create Sale:

````
mutation createSale {
  createSale(
    input: {
      address: "1234 12st Avenue WESTMINSTER"
      latitude: 47.65465
      longitude: -122.39658
      type: "Family Sale"
      categories: ["furniture", "clothing", "tools", "books"]
      desc: "Sewing Notions, Bedding, Furniture, Electronics, toys and records."
      year: 2019
    }
  ) {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Update Sale:

````
mutation updateSale {
  updateSale(
    id: "5df7a5b3c9e1ebb6fa69084a",
    input: {
      address: "3816 31st Avenue West"
      latitude: 47.65465
      longitude: -122.39658
      type: "Family Sale"
      categories: ["furniture", "clothing", "tools", "books"]
      desc: "Sewing Notions, Bedding, Furniture, Electronics, toys and records."
      year: 2019
    }
  ) {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Delete Sale:

````
mutation deleteSale {
  deleteSale(id: "5df7a5b3c9e1ebb6fa69084a") {
    address
  }
}
````

Get Sales:

````
query getSales {
  sales(skip: 0, limit: 20) {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Get Sale By Id:

````
query getSaleById {
  saleById(id: "5df7a5b3c9e1ebb6fa69084a") {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Subscribe to userCreated Event:

````
subscription userCreated {
  userCreated {
    id
    firstName
    lastName
    email
    isAdmin
    createdAt
    updatedAt
  }
}
````

Subscribe to saleCreated Event:

````
subscription saleCreated {
  saleCreated {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
    createdAt
    updatedAt
  }
}
````
