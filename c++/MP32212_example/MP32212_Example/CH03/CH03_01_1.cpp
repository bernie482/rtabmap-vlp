#include <iostream>
#include <cstdlib>  
using namespace std;

int main (void){
    int *intptr = new int(50);
    float *floatptr = new float();
    *floatptr = 0.5;
    cout << *intptr << "\n" << *floatptr << endl;
    //cout << *floatptr << "\t" << endl;

    delete intptr;
    delete floatptr;
} 