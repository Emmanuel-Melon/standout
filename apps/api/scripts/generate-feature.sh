#!/bin/bash

# Feature Generator Script for Ivyi API
# This script creates a minimal feature structure with basic scaffolding

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${BLUE}Usage: $0 <feature_name>${NC}"
    echo ""
    echo "Example:"
    echo "  $0 tweets"
    echo "  $0 documents"
    echo "  $0 notifications"
    exit 1
}

# Check if feature name is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Feature name is required${NC}"
    show_usage
fi

FEATURE_NAME=$1
FEATURE_DIR="../src/feature/${FEATURE_NAME}"

# Convert to singular form for basic naming
SINGULAR_NAME=${FEATURE_NAME%es}
if [[ "$FEATURE_NAME" == *"ies" ]]; then
    SINGULAR_NAME=${FEATURE_NAME%ies}y
elif [[ "$FEATURE_NAME" == *"s" ]]; then
    SINGULAR_NAME=${FEATURE_NAME%?}
fi

# Capitalize first letter for class names
CAPITALIZED_NAME=$(echo "$SINGULAR_NAME" | sed 's/^\(.\)/\U\1/')
UPPER_NAME=$(echo "$FEATURE_NAME" | tr '[:lower:]' '[:upper:]')

echo -e "${GREEN}🚀 Creating new feature: ${FEATURE_NAME}${NC}"
echo "=================================="

# Check if feature already exists
if [ -d "$FEATURE_DIR" ]; then
    echo -e "${RED}❌ Feature '${FEATURE_NAME}' already exists at ${FEATURE_DIR}${NC}"
    exit 1
fi

# Create directory structure
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p "$FEATURE_DIR/controllers"
mkdir -p "$FEATURE_DIR/operations"

echo -e "${GREEN}✅ Directory structure created${NC}"

# Create schema
echo -e "${YELLOW}📄 Creating schema file...${NC}"
cat > "$FEATURE_DIR/${FEATURE_NAME}.schema.ts" << EOF
import { pgTable, text, uuid, timestamp, varchar } from "drizzle-orm/pg-core";

export const ${FEATURE_NAME}Schema = pgTable("${FEATURE_NAME}", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const combined${CAPITALIZED_NAME}Schema = {
  ${FEATURE_NAME}Schema,
};
EOF

# Create types
echo -e "${YELLOW}📄 Creating types file...${NC}"
cat > "$FEATURE_DIR/${FEATURE_NAME}.types.ts" << EOF
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ${FEATURE_NAME}Schema } from "./${FEATURE_NAME}.schema";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

extendZodWithOpenApi(z);

export const ${SINGULAR_NAME}InsertSchema = createInsertSchema(${FEATURE_NAME}Schema).openapi(
  {
    title: "Create${CAPITALIZED_NAME}",
    description: "Request schema for creating a new ${SINGULAR_NAME}",
  },
);

export const ${SINGULAR_NAME}SelectSchema = createSelectSchema(${FEATURE_NAME}Schema).openapi(
  {
    title: "${CAPITALIZED_NAME}",
    description: "Response schema for ${FEATURE_NAME}",
  },
);

export type ${CAPITALIZED_NAME} = z.infer<typeof ${SINGULAR_NAME}SelectSchema>;
export type New${CAPITALIZED_NAME} = z.infer<typeof ${SINGULAR_NAME}InsertSchema>;
EOF

# Create routes file
echo -e "${YELLOW}📄 Creating routes file...${NC}"
cat > "$FEATURE_DIR/${FEATURE_NAME}.routes.ts" << EOF
import { Router } from "express";
import { get${CAPITALIZED_NAME}sController } from "./controllers/get-${FEATURE_NAME}.controller";
import { get${CAPITALIZED_NAME}Controller } from "./controllers/get-${SINGULAR_NAME}.controller";

const ${FEATURE_NAME}Router = Router();

${FEATURE_NAME}Router.get("/", get${CAPITALIZED_NAME}sController);
${FEATURE_NAME}Router.get("/:id", get${CAPITALIZED_NAME}Controller);

export default ${FEATURE_NAME}Router;
export const ${UPPER_NAME}_PATH = "/v1/${FEATURE_NAME}";
EOF

# Create controllers
echo -e "${YELLOW}📄 Creating controllers...${NC}"

# Get all controller
cat > "$FEATURE_DIR/controllers/get-${FEATURE_NAME}.controller.ts" << EOF
import { Request, Response } from "express";
import { findAll } from "../operations/${FEATURE_NAME}.find";
import { asyncHandler } from "@/lib/express/express.async-handler";

export const get${CAPITALIZED_NAME}sController = asyncHandler(async (req: Request, res: Response) => {
  const ${FEATURE_NAME} = await findAll();
  
  // TODO: Handle the response
  // return sendSuccessResponse(
  //   req,
  //   res,
  //   {
  //     data: ${FEATURE_NAME},
  //     serializerConfig: Serialized${CAPITALIZED_NAME},
  //     type: "collection",
  //   },
  //   {
  //     status: HttpStatus.SUCCESS,
  //     additionalMeta: {
  //       total: ${FEATURE_NAME}.length,
  //     },
  //   },
  // );
});
EOF

# Get single controller
cat > "$FEATURE_DIR/controllers/get-${SINGULAR_NAME}.controller.ts" << EOF
import { Request, Response } from "express";
import { findById } from "../operations/${FEATURE_NAME}.find";
import { asyncHandler } from "@/lib/express/express.async-handler";

export const get${CAPITALIZED_NAME}Controller = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const ${SINGULAR_NAME} = await findById(id);
  
  // TODO: Handle the response
  // if (!${SINGULAR_NAME}) {
  //   return sendErrorResponse(req, res, {
  //     status: HttpStatus.NOT_FOUND,
  //     description: "The requested ${SINGULAR_NAME} doesn't exist.",
  //   });
  // }
  // 
  // return sendSuccessResponse(
  //   req,
  //   res,
  //   {
  //     data: ${SINGULAR_NAME},
  //     serializerConfig: Serialized${CAPITALIZED_NAME},
  //     type: "single",
  //   },
  //   {
  //     status: HttpStatus.SUCCESS,
  //   },
  // );
});
EOF

# Create operations
echo -e "${YELLOW}📄 Creating operations...${NC}"

# Find operations
cat > "$FEATURE_DIR/operations/${FEATURE_NAME}.find.ts" << EOF
// TODO: Import your database connection
// import { db } from "@/lib/drizzle";
// import { ${FEATURE_NAME}Schema } from "../${FEATURE_NAME}.schema";

export const findAll = async () => {
  // TODO: Implement the logic to find all ${FEATURE_NAME}
  // Example:
  // const ${FEATURE_NAME} = await db.select().from(${FEATURE_NAME}Schema);
  // return ${FEATURE_NAME};
  
  return []; // Placeholder
};

export const findById = async (id: string) => {
  // TODO: Implement the logic to find ${SINGULAR_NAME} by id
  // Example:
  // const ${SINGULAR_NAME} = await db
  //   .select()
  //   .from(${FEATURE_NAME}Schema)
  //   .where(eq(${FEATURE_NAME}Schema.id, id))
  //   .limit(1);
  // 
  // return ${SINGULAR_NAME}[0] || null;
  
  return null; // Placeholder
};
EOF

echo -e "${GREEN}✅ All files created successfully${NC}"

echo ""
echo -e "${GREEN}🎉 Feature '${FEATURE_NAME}' created successfully!${NC}"
echo "=================================="
echo -e "${YELLOW}📁 Created files:${NC}"
echo "  ${FEATURE_DIR}/"
echo "  ├── controllers/"
echo "  │   ├── get-${FEATURE_NAME}.controller.ts"
echo "  │   └── get-${SINGULAR_NAME}.controller.ts"
echo "  ├── operations/"
echo "  │   └── ${FEATURE_NAME}.find.ts"
echo "  ├── ${FEATURE_NAME}.schema.ts"
echo "  ├── ${FEATURE_NAME}.types.ts"
echo "  └── ${FEATURE_NAME}.routes.ts"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Update the schema fields in ${FEATURE_NAME}.schema.ts"
echo "2. Adjust the types in ${FEATURE_NAME}.types.ts if needed"
echo "3. Complete the operations logic"
echo "4. Handle responses in controllers"
echo "5. Create config file with Serialized${CAPITALIZED_NAME}"
echo "6. Import and register the router in your main router file:"
echo "   import ${FEATURE_NAME}Router from '@/feature/${FEATURE_NAME}/${FEATURE_NAME}.routes';"
echo "   app.use('/v1/${FEATURE_NAME}', ${FEATURE_NAME}Router);"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
