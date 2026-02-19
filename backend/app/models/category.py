from pydantic import BaseModel
from typing import List

class Category(BaseModel):
    id: int
    trip_id: int
    name: str

class CreateCategoryReqeust(BaseModel):
    trip_id: int
    name: str

class UpdateCategoryRequest(BaseModel):
    name: str

class CategoryResponse(BaseModel):
    category: Category

class CategoriesResponse(BaseModel):
    categories: List[Category]