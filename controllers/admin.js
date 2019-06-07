const { validationResult } = require("express-validator/check");

const Product = require("../models/product");
const fileHelper = require("../util/file");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Admin",
    path: "/admin/add-product",
    isAuth: req.session.isLoggedIn,
    errorMessage: null,
    validationErrors: [],
    hasError: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render("admin/add-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      isAuth: req.session.isLoggedIn,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: "Attached file is not an image",
      validationErrors: [],
      hasError: true
    });
  }

  const imageUrl = image.path;
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user
  });
  product
    .save()
    .then(function(result) {
      console.log("Created product");
      res.redirect("/admin/product-list");
    })
    .catch(function(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(function(product) {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        product: product,
        path: "/admin/edit-product",
        pageTitle: "Edit Product",
        isAuth: req.session.isLoggedIn,
        validationErrors: [],
        errorMessage: null
      });
    })
    .catch(function(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = function(req, res) {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;

  Product.findById(prodId)
    .then(function(product) {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }

      if (!product) console.log("not found");
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save().then(function(result) {
        console.log("Updated product");
        res.redirect("/admin/product-list");
      });
    })
    .catch(function(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = function(req, res) {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error("Product not found."));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/product-list");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = function(req, res) {
  Product.find({ userId: req.user._id })
    .then(function(products) {
      res.render("admin/product-list", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/product-list",
        isAuth: req.session.isLoggedIn
      });
    })
    .catch(function(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
