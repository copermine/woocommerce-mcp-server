// Parameters of the upstream WooCommerce/WordPress API methods.
export const catalog: { name: string; fields: string[]; required: string[] }[] = [
  {
    "name": "create_post",
    "fields": [
      "content",
      "status",
      "title"
    ],
    "required": [
      "content",
      "title"
    ]
  },
  {
    "name": "get_posts",
    "fields": [
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "update_post",
    "fields": [
      "content",
      "postId",
      "status",
      "title"
    ],
    "required": [
      "postId"
    ]
  },
  {
    "name": "get_products",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_product",
    "fields": [
      "productId"
    ],
    "required": [
      "productId"
    ]
  },
  {
    "name": "create_product",
    "fields": [
      "productData"
    ],
    "required": [
      "productData"
    ]
  },
  {
    "name": "update_product",
    "fields": [
      "productData",
      "productId"
    ],
    "required": [
      "productData",
      "productId"
    ]
  },
  {
    "name": "delete_product",
    "fields": [
      "force",
      "productId"
    ],
    "required": [
      "productId"
    ]
  },
  {
    "name": "get_orders",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_order",
    "fields": [
      "orderId"
    ],
    "required": [
      "orderId"
    ]
  },
  {
    "name": "create_order",
    "fields": [
      "orderData"
    ],
    "required": [
      "orderData"
    ]
  },
  {
    "name": "update_order",
    "fields": [
      "orderData",
      "orderId"
    ],
    "required": [
      "orderData",
      "orderId"
    ]
  },
  {
    "name": "delete_order",
    "fields": [
      "force",
      "orderId"
    ],
    "required": [
      "orderId"
    ]
  },
  {
    "name": "get_customers",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_customer",
    "fields": [
      "customerId"
    ],
    "required": [
      "customerId"
    ]
  },
  {
    "name": "create_customer",
    "fields": [
      "customerData"
    ],
    "required": [
      "customerData"
    ]
  },
  {
    "name": "update_customer",
    "fields": [
      "customerData",
      "customerId"
    ],
    "required": [
      "customerData",
      "customerId"
    ]
  },
  {
    "name": "delete_customer",
    "fields": [
      "customerId",
      "force"
    ],
    "required": [
      "customerId"
    ]
  },
  {
    "name": "get_sales_report",
    "fields": [
      "dateMax",
      "dateMin",
      "filters",
      "period"
    ],
    "required": []
  },
  {
    "name": "get_products_report",
    "fields": [
      "dateMax",
      "dateMin",
      "filters",
      "page",
      "perPage",
      "period"
    ],
    "required": []
  },
  {
    "name": "get_orders_report",
    "fields": [
      "dateMax",
      "dateMin",
      "filters",
      "page",
      "perPage",
      "period"
    ],
    "required": []
  },
  {
    "name": "get_categories_report",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_customers_report",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_stock_report",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_coupons_report",
    "fields": [
      "dateMax",
      "dateMin",
      "filters",
      "page",
      "perPage",
      "period"
    ],
    "required": []
  },
  {
    "name": "get_taxes_report",
    "fields": [
      "dateMax",
      "dateMin",
      "filters",
      "page",
      "perPage",
      "period"
    ],
    "required": []
  },
  {
    "name": "get_shipping_zones",
    "fields": [
      "filters"
    ],
    "required": []
  },
  {
    "name": "get_shipping_zone",
    "fields": [
      "zoneId"
    ],
    "required": [
      "zoneId"
    ]
  },
  {
    "name": "create_shipping_zone",
    "fields": [
      "zoneData"
    ],
    "required": [
      "zoneData"
    ]
  },
  {
    "name": "update_shipping_zone",
    "fields": [
      "zoneData",
      "zoneId"
    ],
    "required": [
      "zoneData",
      "zoneId"
    ]
  },
  {
    "name": "delete_shipping_zone",
    "fields": [
      "force",
      "zoneId"
    ],
    "required": [
      "zoneId"
    ]
  },
  {
    "name": "get_shipping_methods",
    "fields": [],
    "required": []
  },
  {
    "name": "get_shipping_zone_methods",
    "fields": [
      "zoneId"
    ],
    "required": [
      "zoneId"
    ]
  },
  {
    "name": "create_shipping_zone_method",
    "fields": [
      "methodData",
      "zoneId"
    ],
    "required": [
      "methodData",
      "zoneId"
    ]
  },
  {
    "name": "update_shipping_zone_method",
    "fields": [
      "instanceId",
      "methodData",
      "zoneId"
    ],
    "required": [
      "instanceId",
      "methodData",
      "zoneId"
    ]
  },
  {
    "name": "delete_shipping_zone_method",
    "fields": [
      "force",
      "instanceId",
      "zoneId"
    ],
    "required": [
      "instanceId",
      "zoneId"
    ]
  },
  {
    "name": "get_shipping_zone_locations",
    "fields": [
      "zoneId"
    ],
    "required": [
      "zoneId"
    ]
  },
  {
    "name": "update_shipping_zone_locations",
    "fields": [
      "locations",
      "zoneId"
    ],
    "required": [
      "locations",
      "zoneId"
    ]
  },
  {
    "name": "get_tax_classes",
    "fields": [],
    "required": []
  },
  {
    "name": "create_tax_class",
    "fields": [
      "taxClassData"
    ],
    "required": [
      "taxClassData"
    ]
  },
  {
    "name": "delete_tax_class",
    "fields": [
      "force",
      "slug"
    ],
    "required": [
      "slug"
    ]
  },
  {
    "name": "get_tax_rates",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_tax_rate",
    "fields": [
      "rateId"
    ],
    "required": [
      "rateId"
    ]
  },
  {
    "name": "create_tax_rate",
    "fields": [
      "taxRateData"
    ],
    "required": [
      "taxRateData"
    ]
  },
  {
    "name": "update_tax_rate",
    "fields": [
      "rateId",
      "taxRateData"
    ],
    "required": [
      "rateId",
      "taxRateData"
    ]
  },
  {
    "name": "delete_tax_rate",
    "fields": [
      "force",
      "rateId"
    ],
    "required": [
      "rateId"
    ]
  },
  {
    "name": "get_coupons",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_coupon",
    "fields": [
      "couponId"
    ],
    "required": [
      "couponId"
    ]
  },
  {
    "name": "create_coupon",
    "fields": [
      "couponData"
    ],
    "required": [
      "couponData"
    ]
  },
  {
    "name": "update_coupon",
    "fields": [
      "couponData",
      "couponId"
    ],
    "required": [
      "couponData",
      "couponId"
    ]
  },
  {
    "name": "delete_coupon",
    "fields": [
      "couponId",
      "force"
    ],
    "required": [
      "couponId"
    ]
  },
  {
    "name": "get_order_notes",
    "fields": [
      "filters",
      "orderId",
      "page",
      "perPage"
    ],
    "required": [
      "orderId"
    ]
  },
  {
    "name": "get_order_note",
    "fields": [
      "noteId",
      "orderId"
    ],
    "required": [
      "noteId",
      "orderId"
    ]
  },
  {
    "name": "create_order_note",
    "fields": [
      "noteData",
      "orderId"
    ],
    "required": [
      "noteData",
      "orderId"
    ]
  },
  {
    "name": "delete_order_note",
    "fields": [
      "force",
      "noteId",
      "orderId"
    ],
    "required": [
      "noteId",
      "orderId"
    ]
  },
  {
    "name": "get_order_refunds",
    "fields": [
      "filters",
      "orderId",
      "page",
      "perPage"
    ],
    "required": [
      "orderId"
    ]
  },
  {
    "name": "get_order_refund",
    "fields": [
      "orderId",
      "refundId"
    ],
    "required": [
      "orderId",
      "refundId"
    ]
  },
  {
    "name": "create_order_refund",
    "fields": [
      "orderId",
      "refundData"
    ],
    "required": [
      "orderId",
      "refundData"
    ]
  },
  {
    "name": "delete_order_refund",
    "fields": [
      "force",
      "orderId",
      "refundId"
    ],
    "required": [
      "orderId",
      "refundId"
    ]
  },
  {
    "name": "get_product_variations",
    "fields": [
      "filters",
      "page",
      "perPage",
      "productId"
    ],
    "required": [
      "productId"
    ]
  },
  {
    "name": "get_product_variation",
    "fields": [
      "productId",
      "variationId"
    ],
    "required": [
      "productId",
      "variationId"
    ]
  },
  {
    "name": "create_product_variation",
    "fields": [
      "productId",
      "variationData"
    ],
    "required": [
      "productId",
      "variationData"
    ]
  },
  {
    "name": "update_product_variation",
    "fields": [
      "productId",
      "variationData",
      "variationId"
    ],
    "required": [
      "productId",
      "variationData",
      "variationId"
    ]
  },
  {
    "name": "delete_product_variation",
    "fields": [
      "force",
      "productId",
      "variationId"
    ],
    "required": [
      "productId",
      "variationId"
    ]
  },
  {
    "name": "get_product_attributes",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_product_attribute",
    "fields": [
      "attributeId"
    ],
    "required": [
      "attributeId"
    ]
  },
  {
    "name": "create_product_attribute",
    "fields": [
      "attributeData"
    ],
    "required": [
      "attributeData"
    ]
  },
  {
    "name": "update_product_attribute",
    "fields": [
      "attributeData",
      "attributeId"
    ],
    "required": [
      "attributeData",
      "attributeId"
    ]
  },
  {
    "name": "delete_product_attribute",
    "fields": [
      "attributeId",
      "force"
    ],
    "required": [
      "attributeId"
    ]
  },
  {
    "name": "get_attribute_terms",
    "fields": [
      "attributeId",
      "filters",
      "page",
      "perPage"
    ],
    "required": [
      "attributeId"
    ]
  },
  {
    "name": "get_attribute_term",
    "fields": [
      "attributeId",
      "termId"
    ],
    "required": [
      "attributeId",
      "termId"
    ]
  },
  {
    "name": "create_attribute_term",
    "fields": [
      "attributeId",
      "termData"
    ],
    "required": [
      "attributeId",
      "termData"
    ]
  },
  {
    "name": "update_attribute_term",
    "fields": [
      "attributeId",
      "termData",
      "termId"
    ],
    "required": [
      "attributeId",
      "termData",
      "termId"
    ]
  },
  {
    "name": "delete_attribute_term",
    "fields": [
      "attributeId",
      "force",
      "termId"
    ],
    "required": [
      "attributeId",
      "termId"
    ]
  },
  {
    "name": "get_product_categories",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_product_category",
    "fields": [
      "categoryId"
    ],
    "required": [
      "categoryId"
    ]
  },
  {
    "name": "create_product_category",
    "fields": [
      "categoryData"
    ],
    "required": [
      "categoryData"
    ]
  },
  {
    "name": "update_product_category",
    "fields": [
      "categoryData",
      "categoryId"
    ],
    "required": [
      "categoryData",
      "categoryId"
    ]
  },
  {
    "name": "delete_product_category",
    "fields": [
      "categoryId",
      "force"
    ],
    "required": [
      "categoryId"
    ]
  },
  {
    "name": "get_product_tags",
    "fields": [
      "filters",
      "page",
      "perPage"
    ],
    "required": []
  },
  {
    "name": "get_product_tag",
    "fields": [
      "tagId"
    ],
    "required": [
      "tagId"
    ]
  },
  {
    "name": "create_product_tag",
    "fields": [
      "tagData"
    ],
    "required": [
      "tagData"
    ]
  },
  {
    "name": "update_product_tag",
    "fields": [
      "tagData",
      "tagId"
    ],
    "required": [
      "tagData",
      "tagId"
    ]
  },
  {
    "name": "delete_product_tag",
    "fields": [
      "force",
      "tagId"
    ],
    "required": [
      "tagId"
    ]
  },
  {
    "name": "get_product_reviews",
    "fields": [
      "filters",
      "page",
      "perPage",
      "productId"
    ],
    "required": []
  },
  {
    "name": "get_product_review",
    "fields": [
      "productId",
      "reviewId"
    ],
    "required": [
      "reviewId"
    ]
  },
  {
    "name": "create_product_review",
    "fields": [
      "productId",
      "reviewData"
    ],
    "required": [
      "productId",
      "reviewData"
    ]
  },
  {
    "name": "update_product_review",
    "fields": [
      "productId",
      "reviewData",
      "reviewId"
    ],
    "required": [
      "reviewData",
      "reviewId"
    ]
  },
  {
    "name": "delete_product_review",
    "fields": [
      "force",
      "productId",
      "reviewId"
    ],
    "required": [
      "reviewId"
    ]
  },
  {
    "name": "get_payment_gateways",
    "fields": [],
    "required": []
  },
  {
    "name": "get_payment_gateway",
    "fields": [
      "gatewayId"
    ],
    "required": [
      "gatewayId"
    ]
  },
  {
    "name": "update_payment_gateway",
    "fields": [
      "gatewayData",
      "gatewayId"
    ],
    "required": [
      "gatewayData",
      "gatewayId"
    ]
  },
  {
    "name": "get_settings",
    "fields": [],
    "required": []
  },
  {
    "name": "get_setting_options",
    "fields": [
      "group"
    ],
    "required": [
      "group"
    ]
  },
  {
    "name": "update_setting_option",
    "fields": [
      "group",
      "id",
      "settingData"
    ],
    "required": [
      "group",
      "id",
      "settingData"
    ]
  },
  {
    "name": "get_system_status",
    "fields": [],
    "required": []
  },
  {
    "name": "get_system_status_tools",
    "fields": [],
    "required": []
  },
  {
    "name": "run_system_status_tool",
    "fields": [
      "toolId"
    ],
    "required": [
      "toolId"
    ]
  },
  {
    "name": "get_data",
    "fields": [],
    "required": []
  },
  {
    "name": "get_continents",
    "fields": [],
    "required": []
  },
  {
    "name": "get_countries",
    "fields": [],
    "required": []
  },
  {
    "name": "get_currencies",
    "fields": [],
    "required": []
  },
  {
    "name": "get_current_currency",
    "fields": [],
    "required": []
  },
  {
    "name": "get_post_meta",
    "fields": [
      "metaKey",
      "postId"
    ],
    "required": [
      "postId"
    ]
  },
  {
    "name": "create_post_meta",
    "fields": [
      "metaKey",
      "metaValue",
      "postId"
    ],
    "required": [
      "metaKey",
      "metaValue",
      "postId"
    ]
  },
  {
    "name": "update_post_meta",
    "fields": [
      "metaId",
      "metaValue",
      "postId"
    ],
    "required": [
      "metaId",
      "metaValue",
      "postId"
    ]
  },
  {
    "name": "delete_post_meta",
    "fields": [
      "force",
      "metaId",
      "postId"
    ],
    "required": [
      "metaId",
      "postId"
    ]
  },
  {
    "name": "get_product_meta",
    "fields": [
      "metaKey",
      "productId"
    ],
    "required": [
      "productId"
    ]
  },
  {
    "name": "create_product_meta",
    "fields": [
      "metaKey",
      "metaValue",
      "productId"
    ],
    "required": [
      "metaKey",
      "metaValue",
      "productId"
    ]
  },
  {
    "name": "update_product_meta",
    "fields": [
      "metaKey",
      "metaValue",
      "productId"
    ],
    "required": [
      "metaKey",
      "metaValue",
      "productId"
    ]
  },
  {
    "name": "delete_product_meta",
    "fields": [
      "metaKey",
      "productId"
    ],
    "required": [
      "metaKey",
      "productId"
    ]
  },
  {
    "name": "get_order_meta",
    "fields": [
      "metaKey",
      "orderId"
    ],
    "required": [
      "orderId"
    ]
  },
  {
    "name": "create_order_meta",
    "fields": [
      "metaKey",
      "metaValue",
      "orderId"
    ],
    "required": [
      "metaKey",
      "metaValue",
      "orderId"
    ]
  },
  {
    "name": "update_order_meta",
    "fields": [
      "metaKey",
      "metaValue",
      "orderId"
    ],
    "required": [
      "metaKey",
      "metaValue",
      "orderId"
    ]
  },
  {
    "name": "delete_order_meta",
    "fields": [
      "metaKey",
      "orderId"
    ],
    "required": [
      "metaKey",
      "orderId"
    ]
  },
  {
    "name": "get_customer_meta",
    "fields": [
      "customerId",
      "metaKey"
    ],
    "required": [
      "customerId"
    ]
  },
  {
    "name": "create_customer_meta",
    "fields": [
      "customerId",
      "metaKey",
      "metaValue"
    ],
    "required": [
      "customerId",
      "metaKey",
      "metaValue"
    ]
  },
  {
    "name": "update_customer_meta",
    "fields": [
      "customerId",
      "metaKey",
      "metaValue"
    ],
    "required": [
      "customerId",
      "metaKey",
      "metaValue"
    ]
  },
  {
    "name": "delete_customer_meta",
    "fields": [
      "customerId",
      "metaKey"
    ],
    "required": [
      "customerId",
      "metaKey"
    ]
  }
];
