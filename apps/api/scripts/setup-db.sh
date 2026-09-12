#!/bin/bash

# Database Setup Script for Ivyi API
# This script creates the database and user for the application

set -e  # Exit on any error

# Database configuration
DB_NAME="ivyi_db"
DB_USER="ivyi_user"
DB_PASSWORD="Suv@2024!Dev#Secure"
DB_HOST="localhost"
DB_PORT="5432"
POSTGRES_USER="postgres"  # Default postgres superuser

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Ivyi Database${NC}"
echo "=================================="

# Check if PostgreSQL is running
echo -e "${YELLOW}📋 Checking PostgreSQL connection...${NC}"
if ! pg_isready -h $DB_HOST -p $DB_PORT; then
    echo -e "${RED}❌ PostgreSQL is not running on $DB_HOST:$DB_PORT${NC}"
    echo "Please start PostgreSQL service:"
    echo "  brew services start postgresql  # macOS with Homebrew"
    echo "  sudo systemctl start postgresql  # Linux"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Test connection to postgres database
echo -e "${YELLOW}📋 Testing connection to PostgreSQL...${NC}"
if ! psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -c '\q' 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to PostgreSQL as $POSTGRES_USER${NC}"
    echo "Please ensure PostgreSQL is installed and you can connect as the postgres user"
    exit 1
fi

echo -e "${GREEN}✅ Connected to PostgreSQL${NC}"

# Create database if it doesn't exist
echo -e "${YELLOW}📋 Creating database '$DB_NAME'...${NC}"
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
else
    createdb -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER $DB_NAME
    echo -e "${GREEN}✅ Database '$DB_NAME' created${NC}"
fi

# Create user if it doesn't exist
echo -e "${YELLOW}📋 Creating user '$DB_USER'...${NC}"
USER_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null)

if [ "$USER_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  User '$DB_USER' already exists${NC}"
else
    psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo -e "${GREEN}✅ User '$DB_USER' created${NC}"
fi

# Grant privileges
echo -e "${YELLOW}📋 Granting privileges...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Grant schema privileges
psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

echo -e "${GREEN}✅ Privileges granted${NC}"

# Test the final connection
echo -e "${YELLOW}📋 Testing database connection...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

# Generate DATABASE_URL
DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo ""
echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo "=================================="
echo -e "${YELLOW}📝 Your DATABASE_URL:${NC}"
echo -e "${GREEN}$DATABASE_URL${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Add this to your .env file:"
echo "   DATABASE_URL=\"$DATABASE_URL\""
echo ""
echo "2. Run database migrations and seed data:"
echo "   npm run drizzle:push  # Push schema changes"
echo "   npm run seed           # Seed the database"
echo ""
echo "3. Start your application:"
echo "   npm run dev"
echo ""
echo -e "${GREEN}✨ You're ready to go!${NC}"
