from flask import Flask
from .db import close_db
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    CORS(app)

    # Close DB after request
    app.teardown_appcontext(close_db)

    # Register blueprints
    from .routes.users import users_bp
    from .routes.products import products_bp
    from .routes.sellers import sellers_bp
    from .routes.tickets import tickets_bp
    from .routes.address import address_bp
    from .routes.business import business_bp
    from .routes.buyer import buyer_bp
    from .routes.category import category_bp
    from .routes.credit_cards import creditcards_bp
    from .routes.helpdesk import helpdesk_bp
    from .routes.orders import orders_bp
    from .routes.tag import tag_bp
    from .routes.review import review_bp
    from .routes.transactions import transactions_bp
    from .routes.zipcode import zipcode_bp
    
    from .routes.analytics import analytics_bp

    from .routes.generic import generic_bp # ALWAYS LAST ALWAYS ALWAYS

    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(products_bp, url_prefix="/products")
    app.register_blueprint(sellers_bp, url_prefix="/sellers")
    app.register_blueprint(tickets_bp, url_prefix="/tickets")
    app.register_blueprint(address_bp, url_prefix="/address")
    app.register_blueprint(business_bp, url_prefix="/business")
    app.register_blueprint(buyer_bp, url_prefix="/buyer_table")
    app.register_blueprint(category_bp, url_prefix="/category")
    app.register_blueprint(creditcards_bp, url_prefix="/creditcards")
    app.register_blueprint(helpdesk_bp, url_prefix="/helpdesk_table")
    app.register_blueprint(orders_bp, url_prefix="/orders")
    app.register_blueprint(tag_bp, url_prefix="/tag")
    app.register_blueprint(review_bp, url_prefix="/review")
    app.register_blueprint(transactions_bp, url_prefix="/transaction")
    app.register_blueprint(zipcode_bp, url_prefix="/zipcode")
    app.register_blueprint(analytics_bp, url_prefix="/analytics")

    


    app.register_blueprint(generic_bp, url_prefix="/api")

    print("---- URL MAP ----")
    for rule in app.url_map.iter_rules():
        print(rule, rule.methods)
    print("---- END MAP ----")
    return app
